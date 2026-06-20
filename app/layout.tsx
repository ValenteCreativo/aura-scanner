import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Aura Scanner — Prabhamandala Reader',
  description: 'Lectura del campo luminoso corporal mediante detección de pose y análisis de luminosidad en tiempo real. Basado en el sistema de chakras y la tradición yogui.',
  keywords: ['aura', 'scanner', 'chakra', 'prabhamandala', 'tejas', 'yoga', 'meditation', 'pose detection'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
