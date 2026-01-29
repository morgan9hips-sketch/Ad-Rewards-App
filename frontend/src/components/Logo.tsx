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
    sm: { full: 'h-10', icon: 'h-10 w-10' },
    md: { full: 'h-16', icon: 'h-14 w-14' },
    lg: { full: 'h-24', icon: 'h-20 w-20' },
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
