import { useCurrency } from '../contexts/CurrencyContext'

interface CurrencyDisplayProps {
  amountUsd: number
  showBoth?: boolean  // Also show USD
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function CurrencyDisplay({ 
  amountUsd, 
  showBoth = false, 
  size = 'md',
  className = '' 
}: CurrencyDisplayProps) {
  const { formatAmount, currencyInfo, loading } = useCurrency()

  if (loading) {
    return <span className={className}>Loading...</span>
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold'
  }

  const formatted = formatAmount(amountUsd, false)

  return (
    <div className={`${className}`}>
      <span className={sizeClasses[size]}>{formatted}</span>
      {showBoth && currencyInfo?.displayCurrency !== 'USD' && (
        <span className="text-sm text-gray-400 ml-2">
          ≈ ${amountUsd.toFixed(2)} USD
        </span>
      )}
    </div>
  )
}
