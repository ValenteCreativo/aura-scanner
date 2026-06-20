'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'

// === YOGIC CHAKRA SYSTEM ===
// Mapped to MediaPipe Pose Landmarker points with correct body positions
// Using midpoints between landmarks to place chakras on the spine/body axis
const CHAKRAS = [
  {
    name: 'Sahasrara',
    sanskrit: 'सहस्रार',
    english: 'Corona',
    // Top of head - above nose (landmark 0), offset upward
    landmarks: [0],
    offsetY: -0.06, // above the head
    color: [180, 0, 255],
    element: 'Consciencia pura',
    quality: 'Conexión espiritual, iluminación',
    mantra: 'OM',
    blocked: 'Desconexión, dogmatismo, materialismo excesivo',
    active: 'Sabiduría, unidad con el todo, paz interior',
  },
  {
    name: 'Ajna',
    sanskrit: 'आज्ञा',
    english: 'Tercer Ojo',
    // Between the eyes - midpoint of inner eye corners (1, 4)
    landmarks: [1, 4],
    offsetY: 0,
    color: [75, 0, 200],
    element: 'Luz',
    quality: 'Intuición, percepción, clarividencia',
    mantra: 'OM',
    blocked: 'Confusión, falta de propósito, ilusión',
    active: 'Visión clara, intuición fuerte, imaginación',
  },
  {
    name: 'Vishuddha',
    sanskrit: 'विशुद्ध',
    english: 'Garganta',
    // Throat - midpoint between shoulders (11, 12) moved up toward chin
    landmarks: [11, 12, 0],
    offsetY: 0, // weighted average puts it at throat
    color: [0, 120, 255],
    element: 'Éter (Akasha)',
    quality: 'Comunicación, verdad, expresión',
    mantra: 'HAM',
    blocked: 'Miedo a hablar, secretos, deshonestidad',
    active: 'Expresión auténtica, creatividad verbal, escucha activa',
  },
  {
    name: 'Anahata',
    sanskrit: 'अनाहत',
    english: 'Corazón',
    // Heart center - midpoint between shoulders (11, 12)
    landmarks: [11, 12],
    offsetY: 0.03,
    color: [0, 220, 80],
    element: 'Aire (Vayu)',
    quality: 'Amor, compasión, equilibrio',
    mantra: 'YAM',
    blocked: 'Soledad, amargura, incapacidad de perdonar',
    active: 'Amor incondicional, empatía, armonía interior',
  },
  {
    name: 'Manipura',
    sanskrit: 'मणिपूर',
    english: 'Plexo Solar',
    // Solar plexus - between chest and hips (midpoint of shoulders and hips)
    landmarks: [11, 12, 23, 24],
    offsetY: 0,
    color: [255, 220, 0],
    element: 'Fuego (Agni)',
    quality: 'Poder personal, voluntad, transformación',
    mantra: 'RAM',
    blocked: 'Inseguridad, victimismo, control excesivo',
    active: 'Confianza, determinación, poder de transformación',
  },
  {
    name: 'Svadhisthana',
    sanskrit: 'स्वाधिष्ठान',
    english: 'Sacral',
    // Sacral - slightly above hips (23, 24)
    landmarks: [23, 24],
    offsetY: -0.02,
    color: [255, 140, 0],
    element: 'Agua (Apas)',
    quality: 'Creatividad, placer, emociones',
    mantra: 'VAM',
    blocked: 'Culpa, frigidez emocional, adicciones',
    active: 'Fluidez emocional, creatividad, pasión',
  },
  {
    name: 'Muladhara',
    sanskrit: 'मूलाधार',
    english: 'Raíz',
    // Root - base of spine (between hips, going down toward knees)
    landmarks: [23, 24],
    offsetY: 0.04,
    color: [255, 20, 20],
    element: 'Tierra (Prithvi)',
    quality: 'Supervivencia, enraizamiento, seguridad',
    mantra: 'LAM',
    blocked: 'Miedo, ansiedad, inestabilidad',
    active: 'Seguridad, vitalidad, conexión con la tierra',
  },
]

// Thermal/infrared-inspired color palette for the Prabhamandala (luminous field)
const THERMAL_PALETTE: [number, number, number][] = [
  [0, 0, 40],
  [10, 0, 100],
  [30, 0, 180],
  [0, 80, 220],
  [0, 180, 180],
  [0, 220, 80],
  [180, 255, 0],
  [255, 220, 0],
  [255, 140, 0],
  [255, 60, 20],
  [255, 20, 80],
  [255, 180, 255],
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
  data: Uint8ClampedArray, width: number, height: number,
  x: number, y: number, radius: number
): number {
  let total = 0, count = 0
  const px = Math.round(x), py = Math.round(y)
  for (let dy = -radius; dy <= radius; dy += 3) {
    for (let dx = -radius; dx <= radius; dx += 3) {
      const sx = px + dx, sy = py + dy
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const i = (sy * width + sx) * 4
        // Weighted luminance (perceived brightness)
        total += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
        count++
      }
    }
  }
  return count > 0 ? total / count : 0
}

// Get dominant hue around a point (for more nuanced color reading)
function sampleDominantHue(
  data: Uint8ClampedArray, width: number, height: number,
  x: number, y: number, radius: number
): number {
  let totalR = 0, totalG = 0, totalB = 0, count = 0
  const px = Math.round(x), py = Math.round(y)
  for (let dy = -radius; dy <= radius; dy += 4) {
    for (let dx = -radius; dx <= radius; dx += 4) {
      const sx = px + dx, sy = py + dy
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const i = (sy * width + sx) * 4
        totalR += data[i]; totalG += data[i + 1]; totalB += data[i + 2]
        count++
      }
    }
  }
  if (count === 0) return 0
  const r = totalR / count / 255, g = totalG / count / 255, b = totalB / count / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (max === min) return 0
  let h = 0
  if (max === r) h = ((g - b) / (max - min)) % 6
  else if (max === g) h = (b - r) / (max - min) + 2
  else h = (r - g) / (max - min) + 4
  return (h * 60 + 360) % 360
}

interface ChakraReading {
  name: string
  sanskrit: string
  english: string
  intensity: number
  hue: number
  color: [number, number, number]
  position: { x: number; y: number }
  element: string
  quality: string
  mantra: string
  interpretation: string
}

function getInterpretation(intensity: number, chakra: typeof CHAKRAS[0]): string {
  if (intensity > 0.6) return chakra.active
  if (intensity < 0.25) return chakra.blocked
  return chakra.quality
}

export default function AuraScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [readings, setReadings] = useState<ChakraReading[]>([])
  const [dominantAura, setDominantAura] = useState('')
  const [tejasLevel, setTejasLevel] = useState(0) // Overall luminosity/tejas
  const [error, setError] = useState('')
  const [selectedChakra, setSelectedChakra] = useState<ChakraReading | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

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
    const chakraReadings: ChakraReading[] = []

    // Calculate spine axis for proper chakra placement
    // We need shoulder midpoint and hip midpoint to define the central axis
    const shoulderMid = landmarks[11] && landmarks[12] ? {
      x: (landmarks[11].x + landmarks[12].x) / 2,
      y: (landmarks[11].y + landmarks[12].y) / 2,
    } : null
    const hipMid = landmarks[23] && landmarks[24] ? {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2,
    } : null

    for (const chakra of CHAKRAS) {
      let avgX = 0, avgY = 0, count = 0

      for (const idx of chakra.landmarks) {
        if (idx < landmarks.length) {
          const lm = landmarks[idx]
          if ((lm.visibility ?? 1) > 0.4) {
            avgX += lm.x
            avgY += lm.y
            count++
          }
        }
      }

      if (count === 0) continue
      avgX /= count
      avgY /= count

      // Apply vertical offset
      avgY += chakra.offsetY

      // For Vishuddha (throat): place between head and shoulders
      if (chakra.name === 'Vishuddha' && shoulderMid && landmarks[0]) {
        avgX = (landmarks[0].x + shoulderMid.x) / 2
        avgY = landmarks[0].y + (shoulderMid.y - landmarks[0].y) * 0.6
      }

      // For Manipura (solar plexus): place between shoulders and hips
      if (chakra.name === 'Manipura' && shoulderMid && hipMid) {
        avgX = (shoulderMid.x + hipMid.x) / 2
        avgY = shoulderMid.y + (hipMid.y - shoulderMid.y) * 0.45
      }

      const px = avgX * width
      const py = avgY * height

      // Sample energy around this chakra
      const intensity = sampleIntensity(imageData.data, width, height, px, py, 40)
      const hue = sampleDominantHue(imageData.data, width, height, px, py, 30)
      const thermalColor = getThermalColor(intensity)

      chakraReadings.push({
        name: chakra.name,
        sanskrit: chakra.sanskrit,
        english: chakra.english,
        intensity,
        hue,
        color: thermalColor,
        position: { x: px, y: py },
        element: chakra.element,
        quality: chakra.quality,
        mantra: chakra.mantra,
        interpretation: getInterpretation(intensity, chakra),
      })

      // === DRAW PRABHAMANDALA (luminous aura field) ===
      // Multiple concentric layers with organic noise
      const time = performance.now() * 0.001
      const layers = 6
      for (let layer = layers; layer >= 0; layer--) {
        const baseRadius = 30 + layer * 25
        const wobble = Math.sin(time * 0.5 + layer) * 5
        const radius = baseRadius + wobble
        const alpha = (0.2 - layer * 0.025) * (0.4 + intensity * 0.6)

        // Blend chakra color with thermal reading
        const r = Math.round(thermalColor[0] * 0.4 + chakra.color[0] * 0.6)
        const g = Math.round(thermalColor[1] * 0.4 + chakra.color[1] * 0.6)
        const b = Math.round(thermalColor[2] * 0.4 + chakra.color[2] * 0.6)

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius)
        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha * 1.2})`)
        gradient.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.6})`)
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},${alpha * 0.2})`)
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw chakra center point (bindu)
      ctx.fillStyle = `rgba(${chakra.color[0]},${chakra.color[1]},${chakra.color[2]}, 0.9)`
      ctx.shadowColor = `rgb(${chakra.color[0]},${chakra.color[1]},${chakra.color[2]})`
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(px, py, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw spinning lotus petals around active chakras
      if (intensity > 0.35) {
        const petals = 6 + Math.floor(intensity * 6) // 6-12 petals based on intensity
        const petalRadius = 12 + intensity * 8
        ctx.strokeStyle = `rgba(${chakra.color[0]},${chakra.color[1]},${chakra.color[2]}, ${intensity * 0.4})`
        ctx.lineWidth = 0.8
        for (let p = 0; p < petals; p++) {
          const angle = (p / petals) * Math.PI * 2 + time * 0.3
          const petalX = px + Math.cos(angle) * petalRadius
          const petalY = py + Math.sin(angle) * petalRadius
          ctx.beginPath()
          ctx.arc(petalX, petalY, 3, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }

    // === DRAW SUSHUMNA NADI (central energy channel) ===
    if (chakraReadings.length >= 2) {
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 8])
      for (let i = 1; i < chakraReadings.length; i++) {
        const prev = chakraReadings[i - 1]
        const curr = chakraReadings[i]
        const avgIntensity = (prev.intensity + curr.intensity) / 2
        const color = getThermalColor(avgIntensity)
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.15 + avgIntensity * 0.2})`
        ctx.beginPath()
        // Curved line (nadi flow)
        const cpX = (prev.position.x + curr.position.x) / 2 + Math.sin(performance.now() * 0.002) * 10
        const cpY = (prev.position.y + curr.position.y) / 2
        ctx.moveTo(prev.position.x, prev.position.y)
        ctx.quadraticCurveTo(cpX, cpY, curr.position.x, curr.position.y)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    // === DRAW BODY SKELETON (subtle) ===
    const connections: [number, number][] = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ]
    for (const [i, j] of connections) {
      if (i < landmarks.length && j < landmarks.length) {
        const a = landmarks[i], b = landmarks[j]
        if ((a.visibility ?? 1) > 0.4 && (b.visibility ?? 1) > 0.4) {
          const ax = a.x * width, ay = a.y * height
          const bx = b.x * width, by = b.y * height
          ctx.strokeStyle = `rgba(255,255,255,0.08)`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
          ctx.stroke()
        }
      }
    }

    // === DRAW OUTER PRABHAMANDALA (full-body aura field) ===
    if (shoulderMid && hipMid) {
      const centerX = (shoulderMid.x + hipMid.x) / 2 * width
      const centerY = (shoulderMid.y + hipMid.y) / 2 * height
      const bodyHeight = Math.abs(hipMid.y - shoulderMid.y) * height
      const avgIntensity = chakraReadings.reduce((s, r) => s + r.intensity, 0) / (chakraReadings.length || 1)

      // Outer egg-shaped aura (Auric Egg / Pranamaya Kosha)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(1, 1.4) // Egg shape
      const outerRadius = bodyHeight * 1.2
      const outerGradient = ctx.createRadialGradient(0, 0, bodyHeight * 0.3, 0, 0, outerRadius)
      const mainColor = getThermalColor(avgIntensity)
      outerGradient.addColorStop(0, `rgba(${mainColor[0]},${mainColor[1]},${mainColor[2]},0)`)
      outerGradient.addColorStop(0.6, `rgba(${mainColor[0]},${mainColor[1]},${mainColor[2]},0.03)`)
      outerGradient.addColorStop(0.85, `rgba(${mainColor[0]},${mainColor[1]},${mainColor[2]},0.06)`)
      outerGradient.addColorStop(1, `rgba(${mainColor[0]},${mainColor[1]},${mainColor[2]},0)`)
      ctx.fillStyle = outerGradient
      ctx.beginPath()
      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    setReadings(chakraReadings)

    // Calculate Tejas (overall luminous energy)
    if (chakraReadings.length > 0) {
      const avg = chakraReadings.reduce((s, r) => s + r.intensity, 0) / chakraReadings.length
      setTejasLevel(avg)
      if (avg > 0.7) setDominantAura('Sattva — Luminosidad pura')
      else if (avg > 0.5) setDominantAura('Sattva-Rajas — Luz activa')
      else if (avg > 0.35) setDominantAura('Rajas — Energía dinámica')
      else if (avg > 0.2) setDominantAura('Rajas-Tamas — Transición')
      else setDominantAura('Tamas — Energía en reposo')
    }
  }, [])

  const runDetection = useCallback(() => {
    const video = videoRef.current, canvas = canvasRef.current, overlay = overlayRef.current
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
      if (now === lastTimeRef.current) { animFrameRef.current = requestAnimationFrame(detect); return }
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
      } catch { /* skip */ }
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
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }

      const vision = await import('@mediapipe/tasks-vision')
      const { PoseLandmarker, FilesetResolver } = vision
      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      const poseLandmarker = await PoseLandmarker.createFromOptions(fileset, {
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
      setError(err.name === 'NotAllowedError'
        ? 'Se requiere acceso a la cámara para la lectura del Prabhamandala.'
        : `Error: ${err.message}`)
      setIsLoading(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(interval)
        setCountdown(null)
        performCapture()
      } else {
        setCountdown(count)
      }
    }, 1000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const performCapture = useCallback(() => {
    const video = videoRef.current
    const overlay = overlayRef.current
    if (!video || !overlay) return

    // Create a composite canvas with video + aura overlay + branding
    const cap = document.createElement('canvas')
    const w = video.videoWidth
    const h = video.videoHeight
    cap.width = w
    cap.height = h + 120 // Extra space for branding at bottom
    const ctx = cap.getContext('2d')!

    // Black background
    ctx.fillStyle = '#080604'
    ctx.fillRect(0, 0, cap.width, cap.height)

    // Draw video (mirrored)
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.globalAlpha = 0.35
    ctx.drawImage(video, 0, 0, w, h)
    ctx.restore()

    // Draw aura overlay (mirrored)
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.globalAlpha = 1
    ctx.drawImage(overlay, 0, 0, w, h)
    ctx.restore()

    // Draw branding bar at bottom
    ctx.fillStyle = 'rgba(8, 6, 4, 0.95)'
    ctx.fillRect(0, h, w, 120)

    // Top border line
    const grad = ctx.createLinearGradient(0, h, w, h)
    grad.addColorStop(0, 'rgba(212,175,55,0)')
    grad.addColorStop(0.5, 'rgba(212,175,55,0.3)')
    grad.addColorStop(1, 'rgba(212,175,55,0)')
    ctx.strokeStyle = grad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h)
    ctx.lineTo(w, h)
    ctx.stroke()

    // Aura text
    const auraColor = tejasLevel > 0.7 ? 'Blanco' : tejasLevel > 0.55 ? 'Dorado' : tejasLevel > 0.45 ? 'Violeta' : tejasLevel > 0.38 ? 'Índigo' : tejasLevel > 0.3 ? 'Azul' : tejasLevel > 0.22 ? 'Verde' : tejasLevel > 0.15 ? 'Amarillo' : tejasLevel > 0.08 ? 'Naranja' : 'Rojo'
    ctx.fillStyle = '#d4af37'
    ctx.font = '600 18px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${auraColor} — ${dominantAura}`, w / 2, h + 40)

    // OM + App name
    ctx.fillStyle = 'rgba(212,175,55,0.4)'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('ॐ  Aura Scanner · Prabhamandala Reader', w / 2, h + 70)

    // Tejas level
    ctx.fillStyle = 'rgba(212,175,55,0.3)'
    ctx.font = '11px monospace'
    ctx.fillText(`Tejas: ${Math.round(tejasLevel * 100)} · ${new Date().toLocaleDateString('es-MX')}`, w / 2, h + 100)

    const dataUrl = cap.toDataURL('image/png')
    setCapturedImage(dataUrl)
  }, [dominantAura, tejasLevel])

  const getAuraReading = useCallback((): { color: string; title: string; personality: string; message: string } => {
    if (tejasLevel > 0.7) return {
      color: 'Blanco',
      title: 'Pureza y equilibrio absoluto',
      personality: 'Tu campo refleja un estado de armonía total. El blanco contiene todos los colores en perfecto balance — indica una consciencia expandida, claridad mental profunda y una conexión natural con lo trascendente.',
      message: 'Estás en un momento de iluminación interior. Esta energía no es común; cultívala con meditación y silencio.',
    }
    if (tejasLevel > 0.55) return {
      color: 'Dorado',
      title: 'Protección divina y sabiduría',
      personality: 'El dorado es el color de quienes están guiados por sus ideales más altos. Refleja protección espiritual, inspiración creativa superior y una conexión activa con la sabiduría cósmica.',
      message: 'Tu energía irradia desde un centro de propósito elevado. Confía en tu intuición — estás siendo guiado.',
    }
    if (tejasLevel > 0.45) return {
      color: 'Violeta',
      title: 'Transformación y visión espiritual',
      personality: 'El violeta pertenece a almas altamente sensibles, visionarias y enfocadas en un propósito trascendental. Indica transformación profunda, espiritualidad activa y conexión con planos superiores de consciencia.',
      message: 'Estás en un proceso de transmutación interior. Lo que estás dejando ir te prepara para algo más elevado.',
    }
    if (tejasLevel > 0.38) return {
      color: 'Índigo',
      title: 'Intuición profunda y percepción sutil',
      personality: 'El índigo señala una intuición aguda y una percepción del entorno sutil. Está presente en personas muy intuitivas, contemplativas y con acceso natural a estados expandidos de consciencia.',
      message: 'Tu tercer ojo está activo. Presta atención a los mensajes que llegan en forma de sensaciones, sueños o corazonadas.',
    }
    if (tejasLevel > 0.3) return {
      color: 'Azul',
      title: 'Calma, verdad y expresión auténtica',
      personality: 'El azul revela un estado mental sereno, honestidad natural y capacidad de comunicación clara. Indica paz interior, introspección saludable y una facilidad para expresar tu verdad sin miedo.',
      message: 'Tu garganta está abierta. Es buen momento para decir lo que sientes, crear, cantar o escribir.',
    }
    if (tejasLevel > 0.22) return {
      color: 'Verde',
      title: 'Sanación, compasión y crecimiento',
      personality: 'El verde es el color de la sanación y el amor incondicional. Quienes lo emiten suelen ser protectores naturales, empáticos profundos o personas atravesando un gran crecimiento personal.',
      message: 'Tu corazón está expandido. Tienes la capacidad de sanar con tu presencia — a ti mismo y a otros.',
    }
    if (tejasLevel > 0.15) return {
      color: 'Amarillo',
      title: 'Intelecto, confianza y alegría',
      personality: 'El amarillo se asocia con mentes brillantes, carisma natural y confianza en uno mismo. Refleja optimismo, facilidad para resolver problemas y una energía solar que atrae a los demás.',
      message: 'Tu centro de poder personal está encendido. Aprovecha esta claridad para tomar decisiones importantes.',
    }
    if (tejasLevel > 0.08) return {
      color: 'Naranja',
      title: 'Creatividad, vitalidad y apertura',
      personality: 'El naranja simboliza creatividad desbordante, vitalidad y apertura al cambio. Indica que estás explorando nuevas ideas, viviendo con pasión y manteniendo relaciones abiertas y nutritivas.',
      message: 'Tu energía creativa está en flujo. Permítete explorar sin juicio — la inspiración busca canalizarse a través de ti.',
    }
    return {
      color: 'Rojo',
      title: 'Fuerza, pasión y arraigo',
      personality: 'El rojo representa fuerza física, determinación y conexión con la tierra. Indica una personalidad decidida, ambiciosa y presente — alguien que está firmemente plantado en el mundo material.',
      message: 'Tu raíz está activa. Es momento de acción, de construir, de materializar lo que has estado soñando.',
    }
  }, [tejasLevel])

  const shareTwitter = useCallback(async () => {
    const reading = getAuraReading()

    // Try native share first (allows attaching the image on mobile)
    if (capturedImage && navigator.share) {
      try {
        const blob = await (await fetch(capturedImage)).blob()
        const file = new File([blob], 'mi-aura.png', { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: `Hoy mi campo áurico vibra en ${reading.color} — ${reading.title}.\n\n¿Cuál es el color de tu alma?\n\nDescúbrelo en: ${window.location.href}`,
            files: [file],
          })
          return
        }
      } catch {
        // User cancelled or share failed — fall through to intent
      }
    }

    // Fallback: tweet intent (text only, no image attachment possible)
    const text = `Hoy mi campo áurico vibra en ${reading.color} — ${reading.title}.\n\n¿Cuál es el color de tu alma?\n\nDescúbrelo aquí:`
    const url = window.location.href
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(tweetUrl, '_blank', 'width=600,height=400')
  }, [getAuraReading, capturedImage])

  const shareInstagram = useCallback(async () => {
    if (!capturedImage) return
    try {
      const blob = await (await fetch(capturedImage)).blob()
      const file = new File([blob], 'mi-aura.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        const reading = getAuraReading()
        await navigator.share({
          title: 'Mi Lectura de Aura',
          text: `Mi campo áurico vibra en ${reading.color} — ${reading.title}. ¿Cuál es el tuyo?`,
          files: [file],
        })
      } else {
        downloadImage()
      }
    } catch {
      downloadImage()
    }
  }, [capturedImage, getAuraReading])

  const downloadImage = useCallback(() => {
    if (!capturedImage) return
    const a = document.createElement('a')
    a.href = capturedImage
    a.download = `mi-aura-${Date.now()}.png`
    a.click()
  }, [capturedImage])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current) videoRef.current.srcObject = null
    if (poseLandmarkerRef.current) { poseLandmarkerRef.current.close(); poseLandmarkerRef.current = null }
    setModelReady(false)
    setReadings([])
    setDominantAura('')
    setTejasLevel(0)
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

  // Auto-start
  useEffect(() => {
    if (!isScanning && !isLoading && !modelReady && !error) initScanner()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8">
      {/* Scanner viewport */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-violet-500/10 shadow-[0_0_60px_-10px_rgba(139,92,246,0.15)]">
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 bg-black/95">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border border-violet-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-2 border border-violet-400/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-4 border border-fuchsia-400/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-violet-300 text-lg">ॐ</span>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-violet-200/70 text-sm tracking-wide">Abriendo el tercer ojo...</p>
              <p className="text-gray-600 text-[10px] tracking-widest uppercase">Pose Landmarker</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-8 bg-black/95">
            <span className="text-3xl">🙏</span>
            <p className="text-red-300/80 text-sm text-center max-w-sm">{error}</p>
            <button onClick={() => { setError(''); initScanner() }}
              className="px-5 py-2 text-xs bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 rounded-full transition">
              Reintentar
            </button>
          </div>
        )}

        {/* Video + Overlay */}
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          playsInline muted style={{ opacity: isScanning ? 0.25 : 0 }} />
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          style={{ opacity: isScanning ? 1 : 0 }} />

        {/* Scan overlay effects */}
        {isScanning && (
          <>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent animate-scan-line" />
            </div>
            <div className="absolute inset-0 pointer-events-none p-2">
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-violet-400/30" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-violet-400/30" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-violet-400/30" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-violet-400/30" />
            </div>
          </>
        )}

        {/* Status */}
        {modelReady && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full border border-violet-500/15">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[9px] text-emerald-300/70 uppercase tracking-widest">Tejas</span>
          </div>
        )}

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-amber-400/40 flex items-center justify-center animate-pulse">
                <span className="text-6xl font-extralight text-amber-200/90 text-glow-gold">{countdown}</span>
              </div>
            </div>
          </div>
        )}

        {/* Capture button */}
        {isScanning && countdown === null && !capturedImage && (
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 group"
            title="Capturar foto (3s)"
          >
            <div className="w-14 h-14 rounded-full border-[3px] border-amber-400/40 group-hover:border-amber-400/70 transition-all flex items-center justify-center group-hover:scale-110 group-active:scale-95">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 group-hover:bg-amber-400/40 transition-all" />
            </div>
          </button>
        )}
      </div>

      {/* === READINGS PANEL === */}
      {isScanning && readings.length > 0 && (
        <div className="space-y-6">
          {/* Tejas meter + Guna reading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border" style={{ background: 'rgba(15,12,8,0.6)', borderColor: 'rgba(212,175,55,0.08)' }}>
              <p className="text-[10px] text-amber-400/50 uppercase tracking-[0.3em] mb-3">
                तेज · Tejas — Fuego Interior
              </p>
              <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${tejasLevel * 100}%`,
                    background: `linear-gradient(90deg, rgb(${getThermalColor(0).join(',')}), rgb(${getThermalColor(tejasLevel).join(',')}))`
                  }}
                />
              </div>
              <p className="text-right text-sm text-amber-200/60 mt-2 font-mono">{Math.round(tejasLevel * 100)}</p>
            </div>
            <div className="p-6 rounded-xl border" style={{ background: 'rgba(15,12,8,0.6)', borderColor: 'rgba(212,175,55,0.08)' }}>
              <p className="text-[10px] text-amber-400/50 uppercase tracking-[0.3em] mb-3">
                गुण · Guna — Estado Predominante
              </p>
              <p className="text-lg font-light text-amber-100/90 text-glow-gold">{dominantAura}</p>
              <p className="text-xs text-amber-200/40 mt-2">
                {tejasLevel > 0.5 ? 'Energía luminosa activa' : tejasLevel > 0.25 ? 'Energía en movimiento' : 'Energía en recogimiento'}
              </p>
            </div>
          </div>

          {/* Chakra readings */}
          <div className="space-y-3">
            <p className="text-[10px] text-amber-400/40 uppercase tracking-[0.3em] px-1">
              चक्र · Chakras — Centros de Energía
            </p>
            <div className="space-y-1.5">
              {readings.map((reading) => (
                <button
                  key={reading.name}
                  onClick={() => setSelectedChakra(selectedChakra?.name === reading.name ? null : reading)}
                  className="w-full text-left p-4 rounded-xl border border-transparent hover:border-amber-500/10 transition-all group"
                  style={{ background: 'rgba(15,12,8,0.4)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-5 h-5 rounded-full transition-all duration-300 group-hover:scale-150"
                        style={{
                          backgroundColor: `rgb(${reading.color.join(',')})`,
                          boxShadow: `0 0 ${10 + reading.intensity * 15}px rgba(${reading.color.join(',')}, ${0.4 + reading.intensity * 0.4})`,
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-amber-100/80 font-medium">{reading.name}</span>
                        <span className="text-xs text-amber-400/30">{reading.sanskrit}</span>
                        <span className="text-xs text-amber-200/30">· {reading.english}</span>
                      </div>
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${reading.intensity * 100}%`, backgroundColor: `rgb(${reading.color.join(',')})` }} />
                      </div>
                    </div>
                    <span className="text-sm font-mono text-amber-200/50 w-10 text-right">
                      {Math.round(reading.intensity * 100)}
                    </span>
                  </div>

                  {selectedChakra?.name === reading.name && (
                    <div className="mt-4 pt-4 border-t border-amber-500/10 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-amber-400/40 text-xs mb-1">Elemento</p>
                        <p className="text-amber-100/70">{reading.element}</p>
                      </div>
                      <div>
                        <p className="text-amber-400/40 text-xs mb-1">Mantra</p>
                        <p className="text-amber-100/70 font-mono text-lg">{reading.mantra}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-amber-400/40 text-xs mb-1">Lectura</p>
                        <p className="text-amber-100/60 leading-relaxed">{reading.interpretation}</p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === SHARE MODAL === */}
      {capturedImage && (
        <div className="space-y-8 animate-unfold">
          {/* Reading result */}
          {(() => {
            const reading = getAuraReading()
            return (
              <div className="p-8 rounded-2xl border space-y-5" style={{ background: 'rgba(12,10,6,0.7)', borderColor: 'rgba(212,175,55,0.1)' }}>
                <div className="text-center space-y-1">
                  <p className="text-[9px] text-amber-400/40 uppercase tracking-[0.4em]">Tu lectura de hoy</p>
                  <h3 className="text-2xl font-light text-amber-200/90 text-glow-gold">
                    {reading.color}
                  </h3>
                  <p className="text-sm text-amber-300/50 italic">{reading.title}</p>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
                <p className="text-sm text-amber-100/60 leading-[2] text-center max-w-lg mx-auto">
                  {reading.personality}
                </p>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.06)' }}>
                  <p className="text-sm text-amber-200/70 italic leading-relaxed">
                    &ldquo;{reading.message}&rdquo;
                  </p>
                </div>
                <p className="text-[10px] text-amber-400/25 text-center leading-relaxed">
                  Recuerda: tu aura no es estática. Es un reflejo vivo de tus emociones, salud y estado de consciencia
                  en este instante. Mañana puede ser diferente — y eso es parte de la belleza del ser.
                </p>
              </div>
            )
          })()}

          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border shadow-2xl mx-auto max-w-md"
            style={{ borderColor: 'rgba(212,175,55,0.12)' }}>
            <img src={capturedImage} alt="Captura de aura" className="w-full" />
          </div>

          {/* Share buttons */}
          <div className="space-y-3">
            <p className="text-[10px] text-amber-400/30 text-center uppercase tracking-[0.3em]">Compartir</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Twitter/X */}
              <button onClick={shareTwitter}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                style={{ background: 'rgba(15,12,8,0.6)', borderColor: 'rgba(212,175,55,0.12)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(212,175,55,0.7)' }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-sm text-amber-200/70">Compartir en X</span>
              </button>

              {/* Instagram / Native Share */}
              <button onClick={shareInstagram}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                style={{ background: 'rgba(15,12,8,0.6)', borderColor: 'rgba(212,175,55,0.12)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-sm text-amber-200/70">Historia / Compartir</span>
              </button>

              {/* Download */}
              <button onClick={downloadImage}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                style={{ background: 'rgba(15,12,8,0.6)', borderColor: 'rgba(212,175,55,0.12)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm text-amber-200/70">Guardar imagen</span>
              </button>
            </div>
          </div>

          {/* Dismiss */}
          <div className="flex justify-center">
            <button onClick={() => setCapturedImage(null)}
              className="text-xs text-amber-400/30 hover:text-amber-400/60 transition-colors tracking-wide">
              Cerrar y seguir escaneando
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      {isScanning && (
        <div className="flex justify-center">
          <button onClick={stopScanning}
            className="px-8 py-3 text-sm rounded-full border transition-all tracking-wide hover:scale-105"
            style={{ background: 'rgba(15,12,8,0.5)', borderColor: 'rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.5)' }}>
            Cerrar lectura
          </button>
        </div>
      )}
    </div>
  )
}
