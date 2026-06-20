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
    <div className="relative min-h-screen">
      {/* === COSMIC BACKGROUND === */}
      <div className="fixed inset-0 z-[1]">
        <CosmicParticles />
      </div>

      {/* Ambient energy blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[65vw] h-[65vw] rounded-full blur-[160px] animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(80,40,160,0.05) 50%, transparent 70%)' }} />
        <div className="absolute bottom-[-25%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[140px] animate-breathe"
          style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(160,100,20,0.03) 50%, transparent 70%)' }} />
        <div className="absolute top-[35%] right-[5%] w-[30vw] h-[30vw] rounded-full blur-[100px] animate-breathe"
          style={{ animationDelay: '5s', background: 'radial-gradient(circle, rgba(200,50,150,0.06) 0%, transparent 60%)' }} />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Sacred geometry layers — deeper, more present */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <FlowerOfLife className="w-[800px] h-[800px] opacity-[0.08] animate-rotate-slow" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Metatron className="w-[600px] h-[600px] opacity-[0.05] animate-rotate-reverse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SriYantra className="w-[350px] h-[350px] opacity-[0.07] animate-pulse-glow" />
        </div>

        <div className="relative text-center max-w-3xl mx-auto space-y-12 animate-unfold">
          {/* OM Symbol — alive */}
          <div className="relative mx-auto w-32 h-32 animate-float">
            <div className="absolute inset-0 rounded-full blur-3xl animate-pulse-glow"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)' }} />
            <div className="absolute inset-0 rounded-full border border-amber-500/15 animate-rotate-slow" style={{ animationDuration: '20s' }} />
            <div className="absolute inset-3 rounded-full border border-violet-500/10 animate-rotate-reverse" style={{ animationDuration: '15s' }} />
            <div className="relative w-full h-full rounded-full flex items-center justify-center">
              <span className="text-5xl animate-glow-pulse select-none" style={{ color: '#d4af37' }}>ॐ</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-400/50 animate-flicker">
              प्रभामंडल · Prabhamandala
            </p>
            <h1 className="text-6xl sm:text-8xl font-extralight tracking-tight leading-none text-glow-gold">
              <span className="bg-gradient-to-b from-amber-200 via-amber-100 to-amber-400/50 bg-clip-text text-transparent">
                Aura Scanner
              </span>
            </h1>
            <p className="text-xl text-amber-200/40 font-light tracking-widest">
              Lectura del campo luminoso
            </p>
          </div>

          {/* Ancient text block */}
          <div className="space-y-6 max-w-xl mx-auto">
            <p className="text-base sm:text-lg text-amber-100/70 leading-[2] tracking-wide font-light">
              En la tradición yogui, el <em className="text-amber-300/90 not-italic font-normal">Prabhamandala</em> es
              el halo de luz que irradia del cuerpo sutil — visible para quienes han cultivado
              la percepción interior a través de años de <em className="text-amber-300/90 not-italic">sadhana</em>.
            </p>
            <p className="text-base text-amber-100/50 leading-[2] tracking-wide font-light">
              Este instrumento traduce esa visión ancestral al lenguaje de la tecnología:
              inteligencia artificial detecta tu forma, analiza el <em className="text-violet-300/80 not-italic">Tejas</em> (luminosidad)
              que te rodea, y lo mapea al sistema de <em className="text-violet-300/80 not-italic">siete chakras</em> y
              los <em className="text-violet-300/80 not-italic">tres gunas</em>.
            </p>

            {/* Decorative separator */}
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/20" />
              <span className="text-amber-500/30 text-xs">✦</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/20" />
            </div>
          </div>

          {/* Chakra spine — large, interactive */}
          <div className="flex flex-col items-center py-8">
            <div className="relative">
              {/* Central nadi line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/20 via-amber-500/10 to-red-500/20" />

              {[
                { color: '#b400ff', name: 'Sahasrara', s: 'सहस्रार', en: 'Corona' },
                { color: '#5500cc', name: 'Ajna', s: 'आज्ञा', en: 'Tercer Ojo' },
                { color: '#0088ff', name: 'Vishuddha', s: 'विशुद्ध', en: 'Garganta' },
                { color: '#00dd55', name: 'Anahata', s: 'अनाहत', en: 'Corazón' },
                { color: '#ffcc00', name: 'Manipura', s: 'मणिपूर', en: 'Plexo Solar' },
                { color: '#ff8800', name: 'Svadhisthana', s: 'स्वाधिष्ठान', en: 'Sacral' },
                { color: '#ff2222', name: 'Muladhara', s: 'मूलाधार', en: 'Raíz' },
              ].map((ch, i) => (
                <div key={ch.name} className="group flex items-center gap-4 py-3 relative">
                  <span className="text-xs text-right w-28 transition-all duration-300 opacity-40 group-hover:opacity-90"
                    style={{ color: ch.color }}>{ch.s}</span>
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full transition-all duration-500 group-hover:scale-[2] group-hover:shadow-xl"
                      style={{
                        backgroundColor: ch.color,
                        boxShadow: `0 0 12px ${ch.color}55, 0 0 4px ${ch.color}88`,
                      }} />
                    {/* Petal ring on hover */}
                    <div className="absolute inset-[-8px] rounded-full border border-dashed opacity-0 group-hover:opacity-40 transition-all duration-500 animate-rotate-slow"
                      style={{ borderColor: ch.color, animationDuration: '4s' }} />
                  </div>
                  <div className="text-left w-32 transition-all duration-300">
                    <p className="text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ color: ch.color }}>{ch.name}</p>
                    <p className="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">{ch.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6 space-y-4">
            <button
              onClick={handleStart}
              className="group relative px-14 py-5 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-600/80 via-violet-600/80 to-amber-600/80 animate-shimmer opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-violet-500 to-amber-500 blur-2xl opacity-25 group-hover:opacity-40 animate-shimmer" />
              <div className="absolute inset-[2px] rounded-full bg-[#0a0806]/80 backdrop-blur-sm" />
              <span className="relative text-amber-200/90 font-light tracking-[0.15em] text-base group-hover:text-amber-100 transition-colors">
                INICIAR LECTURA
              </span>
            </button>
            <p className="text-xs text-gray-600">Se requiere acceso a la cámara frontal</p>
          </div>

          {/* Concepts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-16">
            {[
              { title: 'Prabhamandala', s: 'प्रभामंडल', desc: 'El halo luminoso. Detectamos la luz real que envuelve tu cuerpo como reflejo del campo áurico.' },
              { title: 'Tejas', s: 'तेज', desc: 'El fuego interior. Medimos la intensidad lumínica en cada centro energético como indicador de vitalidad.' },
              { title: 'Koshas', s: 'कोश', desc: 'Las cinco envolturas del ser. Visualizamos el Pranamaya Kosha — el cuerpo de energía vital.' },
            ].map((c) => (
              <div key={c.title}
                className="p-6 rounded-xl border transition-all duration-300 hover:border-amber-500/20 group"
                style={{ background: 'rgba(20, 15, 10, 0.4)', borderColor: 'rgba(212, 175, 55, 0.06)' }}>
                <p className="text-sm text-amber-500/40 mb-1 group-hover:text-amber-500/60 transition-colors">{c.s}</p>
                <h3 className="text-base text-amber-200/80 font-medium mb-2 group-hover:text-amber-100 transition-colors">{c.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === SCANNER SECTION === */}
      {showScanner && (
        <section ref={scannerRef} className="relative z-10 min-h-screen px-4 py-24">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <FlowerOfLife className="w-[1000px] h-[1000px]" />
          </div>

          <div className="relative max-w-3xl mx-auto animate-unfold">
            <div className="text-center mb-12 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.5em] text-amber-400/40">Lectura en Vivo</p>
              <h2 className="text-4xl font-extralight tracking-wide text-glow-gold">
                <span className="text-amber-200/80">Tu Prabhamandala</span>
              </h2>
              <p className="text-sm text-gray-500">Detección de pose + análisis de luminosidad corporal</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="h-px w-12 bg-amber-500/15" />
                <span className="text-amber-500/30 text-[10px]">ॐ</span>
                <div className="h-px w-12 bg-amber-500/15" />
              </div>
            </div>
            <AuraScanner />
          </div>
        </section>
      )}

      {/* === DISCLAIMER + FOOTER === */}
      <footer className="relative z-10 px-6 py-16 border-t" style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Disclaimer — ancient scroll style */}
          <div className="relative p-8 rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(20,15,8,0.8) 0%, rgba(15,10,5,0.9) 100%)', border: '1px solid rgba(212,175,55,0.08)' }}>
            {/* Corner ornaments */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-amber-500/15" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-amber-500/15" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-amber-500/15" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-amber-500/15" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/50">☸</span>
                <h3 className="text-sm font-medium text-amber-300/70 tracking-wider uppercase">
                  Sobre esta herramienta
                </h3>
              </div>
              <div className="space-y-3 text-sm text-amber-100/50 leading-[1.9]">
                <p>
                  Esto <strong className="text-amber-200/70">no es un lector de aura real</strong>.
                  No detecta campos electromagnéticos, radiación infrarroja, ni energía kundalini.
                  Es un <strong className="text-amber-200/70">experimento artístico-tecnológico</strong>.
                </p>
                <p>
                  <strong className="text-amber-200/60">Cómo funciona:</strong> MediaPipe Pose Landmarker (IA de Google)
                  detecta 33 puntos de tu cuerpo. Luego muestreamos el brillo y color de los píxeles de la cámara
                  alrededor de cada zona y traducimos eso a una visualización tipo mapa térmico.
                </p>
                <p>
                  Los resultados dependen de la <strong className="text-amber-200/60">iluminación</strong> de tu espacio,
                  el <strong className="text-amber-200/60">color de tu ropa</strong>, el fondo, y la cámara.
                  No es diagnóstico médico ni espiritual.
                </p>
                <p>
                  La terminología sánscrita (chakras, Tejas, Gunas, Prabhamandala, Koshas) se utiliza como
                  <strong className="text-amber-200/60"> marco poético y conceptual</strong> — un puente entre
                  sabiduría ancestral y tecnología contemporánea. Es un homenaje respetuoso, no una certificación.
                </p>
                <p className="text-amber-400/30 italic pt-2">
                  Un espejo tecnológico con alma de manuscrito antiguo. ✦
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-3 pt-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-amber-500/10" />
              <SriYantra className="w-5 h-5 opacity-20" />
              <span className="text-xs text-amber-500/25 tracking-[0.3em] uppercase">v4.0</span>
              <SriYantra className="w-5 h-5 opacity-20" />
              <div className="h-px w-8 bg-amber-500/10" />
            </div>
            <p className="text-[11px] text-gray-700">
              MediaPipe · Canvas · Next.js · Con respeto a las tradiciones
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
