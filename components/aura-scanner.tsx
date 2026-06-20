'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

// Chakra/body zone mapping to MediaPipe Pose Landmarker indices
const BODY_ZONES = [
  { name: 'Corona', landmarks: [0], color: [148, 0, 211] },
  { name: 'Tercer Ojo', landmarks: [1, 4], color: [75, 0, 130] },
  { name: 'Garganta', landmarks: [7, 8], color: [0, 100, 255] },
  { name: 'Corazón', landmarks: [11, 12], color: [0, 255, 100] },
  { name: 'Plexo Solar', landmarks: [23, 24], color: [255, 255, 0] },
  { name: 'Sacral', landmarks: [25, 26], color: [255, 165, 0] },
  { name: 'Raíz', landmarks: [27, 28], color: [255, 0, 0] },
]

const THERMAL_PALETTE: [number, number, number][] = [
  [0, 0, 32],
  [0, 0, 128],
  [0, 80, 255],
  [0, 200, 200],
  [0, 255, 80],
  [128, 255, 0],
  [255, 255, 0],
  [255, 160, 0],
  [255, 60, 0],
  [255, 0, 80],
  [255, 200, 255],
]

function getThermalColor(intensity: number): [number, number, number] {
  const idx = Math.min(intensity * (THERMAL_PALETTE.length - 1), THERMAL_PALETTE.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.min(lower + 1, THERMAL_PALETTE.length - 1)
  const t = idx - lower
  return [
    Math.round(THERMAL_PALETTE[lower][0] + (THERMAL_PALETTE[upper][0] - THERMAL_PALETTE[lower][0]) * t),
    Math.round(THERMAL_PALETTE[lower][1] + (THERMAL_PALETTE[upper][1] - THERMAL_PALETTE[lower][1]) * t),
    Math.round(THERMAL_PALETTE[lower][2] + (THERMAL_PALETTE[upper][2] - THERMAL_PALETTE[lower][2]) * t),
  ]
}

function sampleIntensity(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
): number {
  let total = 0
  let count = 0
  const px = Math.round(x)
  const py = Math.round(y)
  for (let dy = -radius; dy <= radius; dy += 3) {
    for (let dx = -radius; dx <= radius; dx += 3) {
      const sx = px + dx
      const sy = py + dy
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const i = (sy * width + sx) * 4
        total += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
        count++
      }
    }
  }
  return count > 0 ? total / count : 0
}

interface AuraReading {
  zone: string
  intensity: number
  color: [number, number, number]
  position: { x: number; y: number }
}

export default function AuraScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [auraReadings, setAuraReadings] = useState<AuraReading[]>([])
  const [dominantAura, setDominantAura] = useState('')
  const [error, setError] = useState('')

  const poseLandmarkerRef = useRef<any>(null)
  const animFrameRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)
  const lastTimeRef = useRef<number>(-1)

  const drawAura = useCallback((
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{ x: number; y: number; z: number; visibility?: number }>,
    imageData: ImageData,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height)
    const readings: AuraReading[] = []

    for (const zone of BODY_ZONES) {
      let avgX = 0, avgY = 0, count = 0
      for (const idx of zone.landmarks) {
        if (idx < landmarks.length) {
          const lm = landmarks[idx]
          if ((lm.visibility ?? 1) > 0.5) {
            avgX += lm.x * width
            avgY += lm.y * height
            count++
          }
        }
      }
      if (count === 0) continue
      avgX /= count
      avgY /= count

      const intensity = sampleIntensity(imageData.data, width, height, avgX, avgY, 35)
      const thermalColor = getThermalColor(intensity)

      readings.push({ zone: zone.name, intensity, color: thermalColor, position: { x: avgX, y: avgY } })

      // Multi-layer aura glow
      for (let layer = 4; layer >= 0; layer--) {
        const radius = 40 + layer * 30
        const alpha = (0.18 - layer * 0.03) * (0.5 + intensity * 0.5)
        const r = Math.round(thermalColor[0] * 0.55 + zone.color[0] * 0.45)
        const g = Math.round(thermalColor[1] * 0.55 + zone.color[1] * 0.45)
        const b = Math.round(thermalColor[2] * 0.55 + zone.color[2] * 0.45)
        const gradient = ctx.createRadialGradient(avgX, avgY, 0, avgX, avgY, radius)
        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
        gradient.addColorStop(0.6, `rgba(${r},${g},${b},${alpha * 0.4})`)
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(avgX, avgY, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Skeleton connections with thermal coloring
    const connections: [number, number][] = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ]
    for (const [i, j] of connections) {
      if (i < landmarks.length && j < landmarks.length) {
        const a = landmarks[i], b = landmarks[j]
        if ((a.visibility ?? 1) > 0.5 && (b.visibility ?? 1) > 0.5) {
          const ax = a.x * width, ay = a.y * height
          const bx = b.x * width, by = b.y * height
          const midX = (ax + bx) / 2, midY = (ay + by) / 2
          const int = sampleIntensity(imageData.data, width, height, midX, midY, 15)
          const color = getThermalColor(int)
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.7)`
          ctx.lineWidth = 2.5
          ctx.shadowColor = `rgb(${color[0]},${color[1]},${color[2]})`
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }
    }

    // Keypoint dots
    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) > 0.5) {
        const px = lm.x * width, py = lm.y * height
        const int = sampleIntensity(imageData.data, width, height, px, py, 8)
        const color = getThermalColor(int)
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
        ctx.shadowColor = `rgb(${color[0]},${color[1]},${color[2]})`
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(px, py, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Energy lines between zone readings
    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1], curr = readings[i]
      const avgColor = getThermalColor((prev.intensity + curr.intensity) / 2)
      ctx.strokeStyle = `rgba(${avgColor[0]},${avgColor[1]},${avgColor[2]},0.2)`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(prev.position.x, prev.position.y)
      ctx.lineTo(curr.position.x, curr.position.y)
      ctx.stroke()
    }

    setAuraReadings(readings)
    if (readings.length > 0) {
      const avg = readings.reduce((s, r) => s + r.intensity, 0) / readings.length
      if (avg > 0.75) setDominantAura('Blanco — Altísima energía')
      else if (avg > 0.6) setDominantAura('Dorado — Energía espiritual')
      else if (avg > 0.45) setDominantAura('Violeta — Intuición activa')
      else if (avg > 0.35) setDominantAura('Azul — Calma profunda')
      else if (avg > 0.25) setDominantAura('Verde — Equilibrio')
      else if (avg > 0.15) setDominantAura('Naranja — Creatividad')
      else setDominantAura('Rojo — Energía física')
    }
  }, [])

  const runDetection = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!video || !canvas || !overlay || !poseLandmarkerRef.current) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const overlayCtx = overlay.getContext('2d')
    if (!ctx || !overlayCtx) return

    const detect = () => {
      if (!poseLandmarkerRef.current || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }
      const now = performance.now()
      if (now === lastTimeRef.current) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }
      lastTimeRef.current = now
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      overlay.width = video.videoWidth
      overlay.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      try {
        const result = poseLandmarkerRef.current.detectForVideo(video, now)
        if (result.landmarks && result.landmarks.length > 0) {
          drawAura(overlayCtx, result.landmarks[0], imageData, canvas.width, canvas.height)
        }
      } catch { /* skip frame */ }
      animFrameRef.current = requestAnimationFrame(detect)
    }
    detect()
  }, [drawAura])

  const initScanner = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      const vision = await import('@mediapipe/tasks-vision')
      const { PoseLandmarker, FilesetResolver } = vision
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
      poseLandmarkerRef.current = poseLandmarker
      setModelReady(true)
      setIsLoading(false)
      setIsScanning(true)
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Necesitas permitir acceso a la cámara para usar el scanner.'
          : `Error al inicializar: ${err.message}`
      )
      setIsLoading(false)
    }
  }, [])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close()
      poseLandmarkerRef.current = null
    }
    setModelReady(false)
    setAuraReadings([])
    setDominantAura('')
    lastTimeRef.current = -1
  }, [])

  useEffect(() => {
    if (isScanning && modelReady) runDetection()
    return () => { cancelAnimationFrame(animFrameRef.current) }
  }, [isScanning, modelReady, runDetection])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close()
    }
  }, [])

  // Auto-start on mount
  useEffect(() => {
    if (!isScanning && !isLoading && !modelReady) {
      initScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      {/* Scanner viewport */}
      <div className="relative w-full aspect-[4/3] bg-gray-950 rounded-2xl overflow-hidden border border-violet-500/10 shadow-2xl shadow-violet-500/5">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/90 backdrop-blur-sm">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-violet-500/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-violet-400 rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-violet-300/80 text-sm">Abriendo portal...</p>
              <p className="text-gray-600 text-xs">MediaPipe Pose Landmarker</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-8 bg-black/90">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">✕</span>
            </div>
            <p className="text-red-300/80 text-sm text-center max-w-sm">{error}</p>
            <button
              onClick={() => { setError(''); initScanner() }}
              className="px-5 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-full transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Video + Overlay */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          playsInline muted
          style={{ opacity: isScanning ? 0.3 : 0 }}
        />
        <canvas ref={canvasRef} className="hidden" />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          style={{ opacity: isScanning ? 1 : 0 }}
        />

        {/* Scan line effect */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent animate-scan-line" />
          </div>
        )}

        {/* Corner brackets */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none p-3">
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-violet-400/40 rounded-tl" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-violet-400/40 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-violet-400/40 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-violet-400/40 rounded-br" />
          </div>
        )}

        {/* Status badge */}
        {modelReady && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-violet-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider">Activo</span>
          </div>
        )}
      </div>

      {/* Aura readings */}
      {isScanning && auraReadings.length > 0 && (
        <div className="space-y-4">
          {/* Dominant aura */}
          {dominantAura && (
            <div className="text-center py-4 px-6 bg-white/[0.02] backdrop-blur-sm rounded-xl border border-violet-500/10">
              <p className="text-[9px] text-violet-400/50 uppercase tracking-[0.3em] mb-2">Lectura Dominante</p>
              <p className="text-xl font-light bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 bg-clip-text text-transparent">
                {dominantAura}
              </p>
            </div>
          )}

          {/* Zone grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {auraReadings.map((reading) => (
              <div
                key={reading.zone}
                className="p-2 bg-white/[0.02] backdrop-blur-sm rounded-lg border border-white/5 text-center group hover:border-violet-500/20 transition-colors"
              >
                <div
                  className="w-4 h-4 mx-auto rounded-full mb-1.5 transition-transform group-hover:scale-125"
                  style={{
                    backgroundColor: `rgb(${reading.color.join(',')})`,
                    boxShadow: `0 0 8px rgba(${reading.color.join(',')}, 0.5)`,
                  }}
                />
                <p className="text-[9px] text-gray-500 truncate">{reading.zone}</p>
                <p className="text-[11px] font-mono text-gray-300 mt-0.5">
                  {Math.round(reading.intensity * 100)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      {isScanning && (
        <div className="flex justify-center">
          <button
            onClick={stopScanning}
            className="px-6 py-2.5 text-sm bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-gray-200 rounded-full border border-white/10 hover:border-white/20 transition-all"
          >
            Detener lectura
          </button>
        </div>
      )}
    </div>
  )
}
