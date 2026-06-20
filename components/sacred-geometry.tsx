'use client'

export function FlowerOfLife({ className = '' }: { className?: string }) {
  const r = 20
  const centers = [
    [50, 50],
    [50 + r, 50], [50 - r, 50],
    [50 + r * 0.5, 50 - r * 0.866], [50 - r * 0.5, 50 - r * 0.866],
    [50 + r * 0.5, 50 + r * 0.866], [50 - r * 0.5, 50 + r * 0.866],
    // Second ring
    [50 + r * 2, 50], [50 - r * 2, 50],
    [50 + r * 1.5, 50 - r * 0.866], [50 - r * 1.5, 50 - r * 0.866],
    [50 + r * 1.5, 50 + r * 0.866], [50 - r * 1.5, 50 + r * 0.866],
    [50 + r, 50 - r * 1.732], [50 - r, 50 - r * 1.732],
    [50 + r, 50 + r * 1.732], [50 - r, 50 + r * 1.732],
    [50, 50 - r * 1.732], [50, 50 + r * 1.732],
  ]

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flower-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {centers.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="url(#flower-grad)" strokeWidth="0.2" />
      ))}
      {/* Outer binding circle */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#flower-grad)" strokeWidth="0.15" />
    </svg>
  )
}

export function Metatron({ className = '' }: { className?: string }) {
  const center = [50, 50]
  const innerR = 18
  const outerR = 36

  const innerCircles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6
    return [center[0] + Math.cos(angle) * innerR, center[1] + Math.sin(angle) * innerR]
  })
  const outerCircles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6 + Math.PI / 6
    return [center[0] + Math.cos(angle) * outerR, center[1] + Math.sin(angle) * outerR]
  })
  const allPoints = [center, ...innerCircles, ...outerCircles]
  const lines: [number[], number[]][] = []
  for (let i = 0; i < allPoints.length; i++) {
    for (let j = i + 1; j < allPoints.length; j++) {
      lines.push([allPoints[i], allPoints[j]])
    }
  }

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="meta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {lines.map(([a, b], i) => (
        <line key={`l-${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
          stroke="url(#meta-grad)" strokeWidth="0.12" />
      ))}
      {allPoints.map(([cx, cy], i) => (
        <circle key={`c-${i}`} cx={cx} cy={cy} r={2.5} fill="none"
          stroke="url(#meta-grad)" strokeWidth="0.15" />
      ))}
    </svg>
  )
}

export function SriYantra({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sri-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#sri-grad)" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#sri-grad)" strokeWidth="0.2" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="url(#sri-grad)" strokeWidth="0.15" />
      {/* Upward triangles (Shiva) */}
      <polygon points="50,10 90,75 10,75" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      <polygon points="50,20 80,70 20,70" fill="none" stroke="url(#sri-grad)" strokeWidth="0.2" />
      <polygon points="50,30 70,65 30,65" fill="none" stroke="url(#sri-grad)" strokeWidth="0.2" />
      <polygon points="50,38 62,58 38,58" fill="none" stroke="url(#sri-grad)" strokeWidth="0.15" />
      {/* Downward triangles (Shakti) */}
      <polygon points="50,90 10,25 90,25" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      <polygon points="50,80 20,30 80,30" fill="none" stroke="url(#sri-grad)" strokeWidth="0.2" />
      <polygon points="50,70 30,35 70,35" fill="none" stroke="url(#sri-grad)" strokeWidth="0.2" />
      <polygon points="50,62 38,42 62,42" fill="none" stroke="url(#sri-grad)" strokeWidth="0.15" />
      {/* Bindu (center point) */}
      <circle cx="50" cy="50" r="1.5" fill="#d4af37" fillOpacity="0.5" />
    </svg>
  )
}
