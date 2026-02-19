import { useEffect } from 'react'

interface MonetTagAdProps {
  zoneId: string
  onAdComplete?: () => void
}

export default function MonetTagAd({ zoneId, onAdComplete }: MonetTagAdProps) {
  useEffect(() => {
    // Load MonetTag script
    const script = document.createElement('script')
    script.src = `//thubanoa.com/${zoneId}/invoke.js`
    script.async = true
    script.setAttribute('data-cfasync', 'false')

    document.body.appendChild(script)

    // Auto-complete after 30 seconds (user can also manually claim)
    const timer = setTimeout(() => {
      if (onAdComplete) {
        onAdComplete()
      }
    }, 30000)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      clearTimeout(timer)
    }
  }, [zoneId, onAdComplete])

  return (
    <div
      id={`monetag-${zoneId}`}
      className="w-full h-full flex items-center justify-center"
    >
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">📺</div>
        <p className="text-white text-lg">Ad is loading...</p>
        <p className="text-gray-400 text-sm mt-2">
          This may open in a new window
        </p>
      </div>
    </div>
  )
}
