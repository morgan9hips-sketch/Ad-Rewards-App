interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  withLogo?: boolean
}

export default function LoadingSpinner({ size = 'medium', color = 'border-blue-600', withLogo = false }: LoadingSpinnerProps) {
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

  if (withLogo) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <img 
          src="/images/branding/logo-icon.png" 
          alt="Loading..." 
          className={`loading-logo ${logoSizeClasses[size]}`}
        />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  )
}
