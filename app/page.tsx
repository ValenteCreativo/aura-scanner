"use client"

import dynamic from 'next/dynamic'

const AuraApp = dynamic(() => import('../components/aura-app'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-2 border-violet-500/50 border-t-violet-400 rounded-full animate-spin mx-auto" />
        <p className="text-violet-300/60 text-sm tracking-widest uppercase">Preparando el portal...</p>
      </div>
    </div>
  ),
})

export default function Page() {
  return <AuraApp />
}
