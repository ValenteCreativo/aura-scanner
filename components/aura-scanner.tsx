'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

// Chakra/body zone mapping to MediaPipe Pose Landmarker indices
const BODY_ZONES = [
  { name: 'Corona', landmarks: [0], color: [148, 0, 211] },        // nose → violet
  { name: 'Tercer Ojo', landmarks: [1, 4], color: [75, 0, 130] },  // inner eyes → indigo
  { name: 'Garganta', landmarks: [7, 8], color: [0, 100, 255] },   // ears → blue
  { name: 'Corazón', landmarks: [11, 12], color: [0, 255, 100] },  // shoulders → green
  { name: 'Plexo Solar', landmarks: [23, 24], color: [255, 255, 0] }, // hips → yellow
  { name: 'Sacral', landmarks: [25, 26], color: [255, 165, 0] },   // knees → orange
  { name: 'Raíz', landmarks: [27, 28], color: [255, 0, 0] },       // ankles → red
]

// Thermal/infrared color palette
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

    // Draw aura for each body zone
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

      // Sample pixel intensity around this zone
      const intensity = sampleIntensity(imageData.data, width, height, avgX, avgY, 35)
      const thermalColor = getThermalColor(intensity)

      readings.push({
        zone: zone.name,
        intensity,
        color: thermalColor,
        position: { x: avgX, y: avgY },
      })

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

    // Draw body skeleton with thermal coloring
    const connections: [number, number][] = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // arms
      [11, 23], [12, 24], [23, 24],                      // torso
      [23, 25], [25, 27], [24, 26], [26, 28],           // legs
    ]

    for (const [i, j] of connections) {
      if (i < landmarks.length && j < landmarks.length) {
        const a = landmarks[i]
        const b = landmarks[j]
        if ((a.visibility ?? 1) > 0.5 && (b.visibility ?? 1) > 0.5) {
          const ax = a.x * width, ay = a.y * height
          const bx = b.x * width, by = b.y * height
          const midX = (ax + bx) / 2, midY = (ay + by) / 2
          const intensity = sampleIntensity(imageData.data, width, height, midX, midY, 15)
          const color = getThermalColor(intensity)

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

    // Draw keypoint dots
    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) > 0.5) {
        const px = lm.x * width, py = lm.y * height
        const intensity = sampleIntensity(imageData.data, width, height, px, py, 8)
        const color = getThermalColor(intensity)
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
        ctx.shadowColor = `rgb(${color[0]},${color[1]},${color[2]})`
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(px, py, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Energy connections between zone readings
    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1]
      const curr = readings[i]
      const avgColor = getThermalColor((prev.intensity + curr.intensity) / 2)
      ctx.strokeStyle = `rgba(${avgColor[0]},${avgColor[1]},${avgColor[2]},0.25)`
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
      } catch {
        // Skip frame on detection error
      }

      animFrameRef.current = requestAnimationFrame(detect)
    }

    detect()
  }, [drawAura])

  const initScanner = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Load MediaPipe Pose Landmarker
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
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
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
    if (isScanning && modelReady) {
      runDetection()
    }
    return () => { cancelAnimationFrame(animFrameRef.current) }
  }, [isScanning, modelReady, runDetection])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close()
      }
    }
  }, [])

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
              Aura Scanner
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Infrared Field Detector</p>
          </div>
          {modelReady && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Pose Detection activo
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Scanner viewport */}
        <div className="relative w-full max-w-2xl aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/5">
          {/* Idle state */}
          {!isScanning && !isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
              <div className="text-center space-y-3 px-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Detecta tu Campo Áurico</h2>
                <p className="text-sm text-gray-400 max-w-sm">
                  Usa la cámara para detectar tu pose corporal y visualizar el campo
                  energético que te rodea mediante análisis térmico en tiempo real.
                </p>
              </div>
              <button
                onClick={initScanner}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-full transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
              >
                Iniciar Scanner
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/80">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-purple-300 text-sm">Cargando modelo de detección corporal...</p>
              <p className="text-gray-500 text-xs">MediaPipe Pose Landmarker</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-8">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-red-300 text-sm text-center">{error}</p>
              <button
                onClick={() => { setError(''); initScanner() }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Video + Overlay */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            playsInline
            muted
            style={{ opacity: isScanning ? 0.35 : 0 }}
          />
          <canvas ref={canvasRef} className="hidden" />
          <canvas
            ref={overlayRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            style={{ opacity: isScanning ? 1 : 0 }}
          />

          {/* Corner indicators while scanning */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-violet-400/60 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-violet-400/60 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-violet-400/60 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-violet-400/60 rounded-br-lg" />
            </div>
          )}
        </div>

        {/* Aura results panel */}
        {isScanning && auraReadings.length > 0 && (
          <div className="w-full max-w-2xl space-y-3">
            {dominantAura && (
              <div className="text-center py-3 px-6 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Aura Dominante</p>
                <p className="text-lg font-semibold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {dominantAura}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {auraReadings.map((reading) => (
                <div
                  key={reading.zone}
                  className="p-2.5 bg-white/[0.03] backdrop-blur-sm rounded-lg border border-white/5 text-center"
                >
                  <p className="text-[10px] text-gray-500 mb-1 truncate">{reading.zone}</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-lg"
                      style={{
                        backgroundColor: `rgb(${reading.color.join(',')})`,
                        boxShadow: `0 0 6px rgb(${reading.color.join(',')})`,
                      }}
                    />
                    <span className="text-xs font-mono text-gray-300">
                      {Math.round(reading.intensity * 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stop button */}
        {isScanning && (
          <button
            onClick={stopScanning}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium rounded-full transition-all duration-200 border border-white/10 hover:border-white/20"
          >
            Detener Scanner
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/5 text-center">
        <p className="text-[11px] text-gray-600">
          Detección de pose con MediaPipe (MoveNet). Análisis de campo áurico basado en
          muestreo de luminosidad corporal. Resultados experimentales.
        </p>
      </footer>
    </div>
  )
}
