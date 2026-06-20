'use client'

import { useCallback, useEffect, useState } from 'react'
import Particles from '@tsparticles/react'
import type { Container } from '@tsparticles/engine'
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'

export default function CosmicParticles() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = useCallback(async (container?: Container) => {
    // ready
  }, [])

  if (!init) return null

  return (
    <Particles
      id="cosmic-particles"
      className="absolute inset-0 z-0"
      particlesLoaded={particlesLoaded}
      options={{
        fullScreen: false,
        fpsLimit: 60,
        particles: {
          number: {
            value: 70,
            density: { enable: true },
          },
          color: {
            value: ['#8b5cf6', '#a855f7', '#d946ef', '#6366f1', '#3b82f6'],
          },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.08, max: 0.4 },
            animation: {
              enable: true,
              speed: 0.4,
              startValue: 'random',
            },
          },
          size: {
            value: { min: 0.5, max: 2 },
            animation: {
              enable: true,
              speed: 0.8,
              startValue: 'random',
            },
          },
          move: {
            enable: true,
            speed: 0.2,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
          links: {
            enable: true,
            distance: 120,
            color: '#6366f1',
            opacity: 0.06,
            width: 0.5,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
          },
          modes: {
            grab: { distance: 130, links: { opacity: 0.15 } },
          },
        },
        detectRetina: true,
      }}
    />
  )
}
