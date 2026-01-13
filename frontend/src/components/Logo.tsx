interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`${sizeClasses[size]} font-bold`}>💰</span>
      {showText && (
        <span className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
          Ad Rewards
        </span>
      )}
    </div>
  )
}
