"use client"

import dynamic from 'next/dynamic'

const AuraScanner = dynamic(() => import('../components/aura-scanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-purple-300 text-lg">Cargando Aura Scanner...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <AuraScanner />
}
