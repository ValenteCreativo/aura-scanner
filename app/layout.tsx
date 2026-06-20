import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aura Scanner — Infrared Field Detector',
  description: 'Real-time aura visualization using body pose detection and thermal color mapping',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
