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
    }, 150)
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* === LIVING BACKGROUND === */}
      <div className="fixed inset-0 z-0">
        <CosmicParticles />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] bg-violet-950/20 rounded-full blur-[150px] animate-breathe" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[60vw] h-[60vw] bg-fuchsia-950/15 rounded-full blur-[130px] animate-breathe" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[30%] right-[10%] w-[25vw] h-[25vw] bg-indigo-950/10 rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[20%] left-[20%] w-[20vw] h-[20vw] bg-purple-950/10 rounded-full blur-[80px] animate-breathe" style={{ animationDelay: '4s' }} />
      </div>

      {/* === HERO === */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Sacred geometry layers */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <FlowerOfLife className="w-[700px] h-[700px] opacity-[0.07] animate-rotate-slow" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Metatron className="w-[550px] h-[550px] opacity-[0.04] animate-rotate-reverse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SriYantra className="w-[300px] h-[300px] opacity-[0.06] animate-pulse-glow" />
        </div>

        <div className="relative text-center max-w-2xl mx-auto space-y-10">
          {/* Sanskrit symbol */}
          <div className="relative mx-auto w-28 h-28 animate-float">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-violet-400/15 animate-pulse-glow" />
            <div className="relative w-full h-full rounded-full border border-violet-500/20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <span className="text-4xl text-violet-300/70 select-none">ॐ</span>
            </div>
          </div>

          {/* Title block */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-violet-400/40">प्रभामंडल · Prabhamandala</p>
            <h1 className="text-5xl sm:text-7xl font-extralight tracking-tight leading-none">
              <span className="bg-gradient-to-b from-white via-violet-100 to-violet-400/60 bg-clip-text text-transparent">
                Aura Scanner
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 font-light tracking-wide">
              Lectura del campo luminoso corporal
            </p>
          </div>

          {/* Philosophy text */}
          <div className="space-y-5 max-w-lg mx-auto">
            <p className="text-[15px] text-gray-400 leading-[1.8]">
              En la tradición yogui, el <em className="text-violet-300/80 not-italic">Prabhamandala</em> es
              el campo de luz que emana del cuerpo sutil. Este scanner utiliza inteligencia artificial
              para detectar tu forma corporal y analizar los patrones de luminosidad que te rodean,
              mapeándolos al sistema de <em className="text-violet-300/80 not-italic">siete chakras</em> y
              los <em className="text-violet-300/80 not-italic">tres gunas</em> de la tradición védica.
            </p>
            <p className="text-sm text-gray-500/80 leading-[1.8]">
              El <em className="text-violet-300/60 not-italic">Tejas</em> (fuego interior) se mide
              analizando la luminosidad circundante de cada centro energético. Cada chakra recibe
              una lectura basada en las condiciones reales de luz captadas por la cámara — un
              espejo tecnológico de conceptos ancestrales.
            </p>
          </div>

          {/* Chakra spine visualization */}
          <div className="flex flex-col items-center gap-0 py-6">
            <div className="relative flex flex-col items-center">
              {[
                { color: '#b400ff', name: 'Sahasrara', sanskrit: 'सहस्रार' },
                { color: '#4b00c8', name: 'Ajna', sanskrit: 'आज्ञा' },
                { color: '#0078ff', name: 'Vishuddha', sanskrit: 'विशुद्ध' },
                { color: '#00dc50', name: 'Anahata', sanskrit: 'अनाहत' },
                { color: '#ffdc00', name: 'Manipura', sanskrit: 'मणिपूर' },
                { color: '#ff8c00', name: 'Svadhisthana', sanskrit: 'स्वाधिष्ठान' },
                { color: '#ff1414', name: 'Muladhara', sanskrit: 'मूलाधार' },
              ].map((chakra, i) => (
                <div key={chakra.name} className="group flex items-center gap-3 py-1.5">
                  {/* Connecting line */}
                  {i > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 w-px h-3 bg-gradient-to-b from-transparent via-white/10 to-transparent" style={{ top: `${i * 36 - 6}px` }} />
                  )}
                  <span className="text-[9px] text-gray-600 w-24 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    {chakra.sanskrit}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:shadow-lg"
                    style={{
                      backgroundColor: chakra.color,
                      boxShadow: `0 0 8px ${chakra.color}44`,
                    }}
                  />
                  <span className="text-[10px] text-gray-500 w-24 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                    {chakra.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button
              onClick={handleStart}
              className="group relative px-12 py-4 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 via-fuchsia-600/90 to-violet-600/90 group-hover:opacity-100 opacity-80 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-[1px] rounded-full bg-black/30" />
              <span className="relative text-white/90 font-light tracking-wider text-sm sm:text-base">
                Iniciar Lectura del Prabhamandala
              </span>
            </button>
            <p className="text-[10px] text-gray-600 mt-4">Requiere acceso a la cámara</p>
          </div>

          {/* Concepts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-14 text-left">
            {[
              {
                title: 'Prabhamandala',
                sanskrit: 'प्रभामंडल',
                desc: 'El círculo de luz que emana del cuerpo. Detectamos la luminosidad real que te rodea.',
              },
              {
                title: 'Tejas',
                sanskrit: 'तेज',
                desc: 'El fuego interior. Medimos la intensidad lumínica de cada zona corporal como indicador.',
              },
              {
                title: 'Koshas',
                sanskrit: 'कोश',
                desc: 'Las capas del ser. Visualizamos el Pranamaya Kosha (cuerpo energético) como campo áurico.',
              },
            ].map((concept) => (
              <div key={concept.title}
                className="p-5 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-violet-500/15 transition-colors">
                <p className="text-[10px] text-violet-400/40 mb-1">{concept.sanskrit}</p>
                <h3 className="text-sm text-gray-200 font-medium">{concept.title}</h3>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{concept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === SCANNER SECTION === */}
      {showScanner && (
        <section ref={scannerRef} className="relative z-10 min-h-screen px-4 py-20">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <FlowerOfLife className="w-[900px] h-[900px]" />
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="text-center mb-10 space-y-2">
              <p className="text-[9px] uppercase tracking-[0.4em] text-violet-400/40">Lectura en Vivo</p>
              <h2 className="text-3xl font-extralight text-white/80 tracking-wide">
                Tu Prabhamandala
              </h2>
              <p className="text-xs text-gray-600">Detección de pose + análisis de luminosidad en tiempo real</p>
            </div>
            <AuraScanner />
          </div>
        </section>
      )}

      {/* === DISCLAIMER + FOOTER === */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Disclaimer */}
          <div className="p-6 rounded-xl bg-white/[0.015] border border-amber-500/10">
            <div className="flex items-start gap-3">
              <span className="text-amber-400/60 text-sm mt-0.5">⚠</span>
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-amber-300/70 uppercase tracking-wider">
                  Nota Importante — Esto no es un lector de aura real
                </h3>
                <div className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
                  <p>
                    Este proyecto es un <strong className="text-gray-400">experimento artístico y tecnológico</strong>.
                    No detecta campos electromagnéticos reales, radiación infrarroja, ni energía espiritual.
                  </p>
                  <p>
                    Lo que hace: usa <strong className="text-gray-400">MediaPipe Pose Landmarker</strong> (IA de Google)
                    para detectar 33 puntos de tu cuerpo en la imagen de la cámara. Luego
                    <strong className="text-gray-400"> muestrea los píxeles</strong> (brillo y color) alrededor de
                    cada zona corporal y traduce esa información a una paleta térmica visual.
                  </p>
                  <p>
                    Los resultados dependen de las <strong className="text-gray-400">condiciones de iluminación</strong>,
                    el color de tu ropa, el fondo detrás de ti, y la calidad de tu cámara. No tiene
                    ninguna base médica, científica, ni diagnóstica.
                  </p>
                  <p>
                    La terminología yogui (chakras, Tejas, Gunas, Prabhamandala) se usa como
                    <strong className="text-gray-400"> marco conceptual y estético</strong> para hacer la
                    experiencia más interesante. Es un homenaje a tradiciones milenarias, no una
                    herramienta espiritual certificada.
                  </p>
                  <p className="text-gray-600 italic">
                    Úsalo como lo que es: un espejo tecnológico con alma artística. ✨
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-4">
            <div className="flex items-center justify-center gap-2">
              <SriYantra className="w-4 h-4 opacity-30" />
              <span className="text-[10px] text-gray-700 tracking-widest uppercase">Aura Scanner v3.0</span>
              <SriYantra className="w-4 h-4 opacity-30" />
            </div>
            <p className="text-[10px] text-gray-800">
              Hecho con MediaPipe · Canvas · Next.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
