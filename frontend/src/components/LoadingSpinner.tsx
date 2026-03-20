interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  color?: string
  withLogo?: boolean
  text?: string
  progress?: number
}

export default function LoadingSpinner({
  size = 'medium',
  color = 'border-blue-600',
  withLogo = false,
  text,
  progress,
}: LoadingSpinnerProps) {
  const spinnerSize = size === 'fullscreen' ? 'large' : size

  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  }

  const logoSizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
  }

  const progressValue = Math.min(100, Math.max(0, progress ?? 0))

  const spinner = withLogo ? (
    <div className="flex flex-col justify-center items-center gap-4">
      <img
        src="/images/branding/Adcoin large 512x512.png"
        alt="Loading..."
        className={`loading-logo ${logoSizeClasses[spinnerSize]} animate-spin-slow`}
      />
      <p className="text-gray-400 text-sm">{text || 'Loading...'}</p>
      {progress !== undefined && (
        <progress
          className="h-1 w-32 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
          max={100}
          value={progressValue}
        />
      )}
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center gap-3">
      <div
        className={`${sizeClasses[spinnerSize]} ${color} border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
      {progress !== undefined && (
        <progress
          className="h-1 w-32 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
          max={100}
          value={progressValue}
        />
      )}
    </div>
  )

  if (size === 'fullscreen') {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        {spinner}
      </div>
    )
  }

  return <div className="flex justify-center items-center">{spinner}</div>
}
