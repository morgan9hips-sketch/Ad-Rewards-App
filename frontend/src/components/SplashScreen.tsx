import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  minDisplayMs?: number
}

export default function SplashScreen({
  onComplete,
  minDisplayMs = 5000,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    // Phase 1: fade-in background + scale logo (0–800ms)
    const holdTimer = setTimeout(() => {
      setPhase('hold')
    }, 800)

    // Phase 2: hold with pulse (800ms – minDisplayMs)
    const outTimer = setTimeout(() => {
      setPhase('out')
    }, minDisplayMs)

    // Phase 3: after fade-out animation (500ms), call onComplete
    const completeTimer = setTimeout(() => {
      onComplete()
    }, minDisplayMs + 500)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(outTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, minDisplayMs])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,_#0a0a0a_0%,_#1a1a2e_50%,_#0a0a0a_100%)] transition-opacity duration-500 ${
        phase === 'out' ? 'opacity-0' : 'opacity-100'
      }`}
      aria-label="Loading Adify"
      role="status"
    >
      {/* Background Logo - Top Half */}
      <div className="absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center overflow-hidden opacity-30">
        <img
          src="/images/branding/logo-full.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Logo container */}
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-800 relative z-10 ${
          phase === 'in' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Logo with glow */}
        <div className={`relative ${phase === 'hold' ? 'animate-pulse' : ''}`}>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_#3b82f6,_transparent_70%)] blur-2xl opacity-40" />
          <img
            src="/images/branding/Adcoin large 512x512.png"
            alt="Adify"
            className="relative w-32 h-32 object-contain drop-shadow-2xl animate-spin-slow"
            onError={(e) => {
              // Fallback to text logo if image fails
              const target = e.currentTarget
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = document.createElement('div')
                fallback.className =
                  'w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold'
                fallback.textContent = 'A'
                parent.appendChild(fallback)
              }
            }}
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-wider">
            Adi<span className="text-blue-500">fy</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase">
            Earn While You Watch
          </p>
          <p className="text-gray-400 text-sm mt-2 animate-pulse">Loading...</p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-4 relative z-10">
          <div
            className={`h-full rounded-full bg-blue-500 ${
              phase === 'in'
                ? 'w-1/5 transition-[width] duration-[800ms] ease-out'
                : phase === 'hold'
                  ? 'w-4/5 transition-[width] duration-[1200ms] ease-in-out'
                  : 'w-full transition-[width] duration-[1200ms] ease-in-out'
            }`}
          />
        </div>
      </div>

      {/* Version */}
      <p className="absolute bottom-8 text-gray-600 text-xs relative z-10">
        v1.0.0
      </p>
    </div>
  )
}
