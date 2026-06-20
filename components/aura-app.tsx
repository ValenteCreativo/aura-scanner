'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { FlowerOfLife, Metatron, SriYantra } from './sacred-geometry'

const CosmicParticles = dynamic(() => import('./cosmic-particles'), { ssr: false })
const AuraScanner = dynamic(() => import('./aura-scanner'), { ssr: false })

export default function AuraApp() {
  const [showScanner, setShowScanner] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  const handleStart = () => {
    setShowScanner(true)
    setTimeout(() => {
      scannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background particles */}
      <div className="fixed inset-0 z-0">
        <CosmicParticles />
      </div>

      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-violet-900/10 rounded-full blur-[120px] animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-900/10 rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] bg-indigo-900/8 rounded-full blur-[80px] animate-breathe" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Sacred geometry background decorations */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <FlowerOfLife className="w-[600px] h-[600px] opacity-20 animate-rotate-slow" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Metatron className="w-[500px] h-[500px] opacity-10 animate-rotate-reverse" />
        </div>

        {/* Hero content */}
        <div className="relative text-center max-w-2xl mx-auto space-y-8">
          {/* Logo / Icon */}
          <div className="relative mx-auto w-24 h-24 animate-float">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 blur-xl" />
            <div className="relative w-full h-full rounded-full border border-violet-500/30 flex items-center justify-center backdrop-blur-sm bg-white/[0.02]">
              <SriYantra className="w-14 h-14 opacity-80" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight">
              <span className="bg-gradient-to-b from-white via-violet-100 to-violet-300/80 bg-clip-text text-transparent">
                Aura Scanner
              </span>
            </h1>
            <p className="text-lg text-violet-300/60 font-light tracking-wide">
              Infrared Field Detector
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4 max-w-lg mx-auto">
            <p className="text-[15px] text-gray-400 leading-relaxed">
              Detecta y visualiza tu campo áurico en tiempo real. Usando inteligencia artificial
              para reconocimiento corporal y análisis térmico de imagen, este scanner mapea
              las zonas energéticas de tu cuerpo y revela los colores de tu aura.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Basado en MediaPipe Pose Detection, el sistema identifica 33 puntos de tu cuerpo
              y analiza la luminosidad circundante para generar un mapa térmico que se traduce
              en los 7 colores del campo áurico — desde la Raíz hasta la Corona.
            </p>
          </div>

          {/* Chakra color strip */}
          <div className="flex items-center justify-center gap-1.5 py-4">
            {[
              { color: '#ff0000', label: 'Raíz' },
              { color: '#ff8800', label: 'Sacral' },
              { color: '#ffdd00', label: 'Plexo' },
              { color: '#00cc44', label: 'Corazón' },
              { color: '#0066ff', label: 'Garganta' },
              { color: '#4400aa', label: 'Tercer Ojo' },
              { color: '#8800dd', label: 'Corona' },
            ].map((chakra) => (
              <div key={chakra.label} className="group relative">
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-transform duration-300 group-hover:scale-125"
                  style={{
                    backgroundColor: chakra.color,
                    boxShadow: `0 0 12px ${chakra.color}44, 0 0 4px ${chakra.color}88`,
                  }}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {chakra.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-6">
            <button
              onClick={handleStart}
              className="group relative px-10 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Button glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              {/* Button border */}
              <div className="absolute inset-[1px] rounded-full bg-black/20 backdrop-blur-sm" />
              {/* Button text */}
              <span className="relative text-white font-medium tracking-wide">
                Iniciar Lectura de Aura
              </span>
            </button>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
            {[
              {
                title: 'Pose Detection',
                desc: 'IA que detecta 33 puntos de tu cuerpo en tiempo real',
                icon: '◉',
              },
              {
                title: 'Análisis Térmico',
                desc: 'Muestreo de luminosidad por zona para mapeo de calor',
                icon: '◈',
              },
              {
                title: '7 Chakras',
                desc: 'Mapeo energético desde la Raíz hasta la Corona',
                icon: '✦',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
              >
                <span className="text-violet-400 text-lg">{feature.icon}</span>
                <h3 className="text-sm font-medium text-gray-200 mt-2">{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        {showScanner && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
        )}
      </section>

      {/* === SCANNER SECTION === */}
      {showScanner && (
        <section ref={scannerRef} className="relative z-10 min-h-screen px-4 py-16">
          {/* Decorative geometry behind scanner */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <FlowerOfLife className="w-[800px] h-[800px]" />
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-8 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400/60">
                Lectura en Tiempo Real
              </p>
              <h2 className="text-2xl font-light text-white/90">
                Campo Áurico
              </h2>
            </div>

            {/* Scanner component */}
            <AuraScanner />
          </div>
        </section>
      )}

      {/* === FOOTER === */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <SriYantra className="w-5 h-5 opacity-40" />
            <span className="text-xs text-gray-600 tracking-wide">Aura Scanner</span>
          </div>
          <p className="text-[10px] text-gray-700 max-w-md mx-auto leading-relaxed">
            Detección de pose con MediaPipe Pose Landmarker. Análisis de campo áurico
            basado en muestreo de luminosidad. Los resultados son experimentales y
            con fines de exploración y entretenimiento.
          </p>
        </div>
      </footer>
    </div>
  )
}
