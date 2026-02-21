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

  const spinner = withLogo ? (
    <div className="flex flex-col justify-center items-center gap-4">
      <img
        src="/images/branding/logo-icon.png"
        alt="Loading..."
        className={`loading-logo ${logoSizeClasses[spinnerSize]}`}
      />
      <p className="text-gray-400 text-sm">{text || 'Loading...'}</p>
      {progress !== undefined && (
        <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center gap-3">
      <div
        className={`${sizeClasses[spinnerSize]} ${color} border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
      {progress !== undefined && (
        <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
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

  return (
    <div className="flex justify-center items-center">
      {spinner}
    </div>
  )
}
