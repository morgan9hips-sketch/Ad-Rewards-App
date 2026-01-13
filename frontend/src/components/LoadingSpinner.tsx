interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export default function LoadingSpinner({ size = 'medium', color = 'border-blue-600' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  )
}
