import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  minDisplayMs?: number
}

export default function SplashScreen({ onComplete, minDisplayMs = 5000 }: SplashScreenProps) {
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 overflow-hidden ${
        phase === 'out' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      }}
      aria-label="Loading Adify"
      role="status"
    >
      {/* Background Logo - Top Half */}
      <div className="absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center overflow-hidden opacity-20">
        <img
          src="/images/branding/Adcoin-large-512x512.png"
          alt=""
          className="w-96 h-96 object-contain drop-shadow-2xl"
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
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
          />
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
                fallback.className = 'w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold'
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
          <p className="text-gray-400 text-sm mt-2 animate-pulse">
            Loading...
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-4 relative z-10">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{
              width: phase === 'in' ? '20%' : phase === 'hold' ? '80%' : '100%',
              transition: phase === 'in' ? 'width 0.8s ease-out' : 'width 1.2s ease-in-out',
            }}
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
