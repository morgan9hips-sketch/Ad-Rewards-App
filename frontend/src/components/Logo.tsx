interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'full' | 'icon'
}

export default function Logo({
  size = 'md',
  showText = true,
  variant = 'full',
}: LogoProps) {
  const sizeClasses = {
    sm: { full: 'h-16', icon: 'h-16 w-16' },
    md: { full: 'h-24', icon: 'h-24 w-24' },
    lg: { full: 'h-32', icon: 'h-32 w-32' },
  }

  // Use icon variant for mobile when showText is false or explicitly requested
  const shouldShowIcon = variant === 'icon' || !showText

  if (shouldShowIcon) {
    return (
      <img
        src="/images/branding/logo-icon.png"
        alt="Adify"
        className={`${sizeClasses[size].icon} object-contain`}
      />
    )
  }

  return (
    <img
      src="/images/branding/logo-full.png"
      alt="Adify - Watch Ads, Earn Real Money"
      className={`${sizeClasses[size].full} w-auto object-contain`}
    />
  )
}
