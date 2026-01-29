interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'full' | 'icon'
}

export default function Logo({ size = 'md', showText = true, variant = 'full' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  }

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  // Use icon variant for mobile when showText is false or explicitly requested
  const shouldShowIcon = variant === 'icon' || !showText
  
  if (shouldShowIcon) {
    return (
      <div className="flex items-center justify-center">
        <span className={`${sizeClasses[size]}`} role="img" aria-label="Adify">
          📺
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`${sizeClasses[size]}`} role="img" aria-label="TV">
        📺
      </span>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-white`}>
          Adify
        </span>
      )}
    </div>
  )
}
