'use client'

export function FlowerOfLife({ className = '' }: { className?: string }) {
  // Flower of Life: 7 overlapping circles
  const r = 20
  const centers = [
    [50, 50],
    [50 + r, 50],
    [50 - r, 50],
    [50 + r * 0.5, 50 - r * 0.866],
    [50 - r * 0.5, 50 - r * 0.866],
    [50 + r * 0.5, 50 + r * 0.866],
    [50 - r * 0.5, 50 + r * 0.866],
  ]

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flower-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#d946ef" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {centers.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#flower-grad)"
          strokeWidth="0.3"
        />
      ))}
    </svg>
  )
}

export function Metatron({ className = '' }: { className?: string }) {
  // Metatron's Cube: 13 circles + connecting lines
  const r = 8
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

  // Connect all points
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
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {lines.map(([a, b], i) => (
        <line
          key={`l-${i}`}
          x1={a[0]} y1={a[1]}
          x2={b[0]} y2={b[1]}
          stroke="url(#meta-grad)"
          strokeWidth="0.15"
        />
      ))}
      {allPoints.map(([cx, cy], i) => (
        <circle
          key={`c-${i}`}
          cx={cx} cy={cy} r={r * 0.4}
          fill="none"
          stroke="url(#meta-grad)"
          strokeWidth="0.2"
        />
      ))}
    </svg>
  )
}

export function SriYantra({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sri-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="url(#sri-grad)" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#sri-grad)" strokeWidth="0.2" />
      {/* Upward triangles */}
      <polygon points="50,8 92,78 8,78" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      <polygon points="50,18 82,72 18,72" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      <polygon points="50,28 72,66 28,66" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      {/* Downward triangles */}
      <polygon points="50,92 8,22 92,22" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      <polygon points="50,82 18,28 82,28" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      <polygon points="50,72 28,34 72,34" fill="none" stroke="url(#sri-grad)" strokeWidth="0.25" />
      {/* Center dot */}
      <circle cx="50" cy="50" r="1.5" fill="url(#sri-grad)" />
    </svg>
  )
}
