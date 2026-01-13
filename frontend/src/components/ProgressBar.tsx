interface ProgressBarProps {
  progress: number
  max?: number
  color?: string
  showLabel?: boolean
  label?: string
}

export default function ProgressBar({
  progress,
  max = 100,
  color = 'bg-blue-600',
  showLabel = true,
  label,
}: ProgressBarProps) {
  const percentage = Math.min((progress / max) * 100, 100)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{label || 'Progress'}</span>
          <span>
            {progress} / {max}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
