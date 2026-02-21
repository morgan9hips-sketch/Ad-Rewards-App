/**
 * Skeleton loading components for better perceived performance
 */

interface SkeletonProps {
  className?: string
}

function SkeletonBlock({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-800 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

/** Single-line text skeleton */
export function SkeletonText({ className = '' }: SkeletonProps) {
  return <SkeletonBlock className={`h-4 rounded ${className}`} />
}

/** Card skeleton with title and body lines */
export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-gray-900 rounded-xl p-4 border border-gray-800 ${className}`} aria-hidden="true">
      <SkeletonBlock className="h-5 w-3/4 mb-3" />
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-5/6" />
    </div>
  )
}

/** List of skeleton rows for tables/lists */
export function SkeletonList({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-800">
          <SkeletonBlock className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-3 w-1/3" />
          </div>
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

/** Dashboard stats card skeleton */
export function SkeletonStats({ className = '' }: SkeletonProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <SkeletonBlock className="h-3 w-3/4 mb-3" />
          <SkeletonBlock className="h-7 w-1/2" />
        </div>
      ))}
    </div>
  )
}

/** Table skeleton with header and rows */
export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-800 ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="bg-gray-800 p-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3 flex gap-4 border-t border-gray-800 bg-gray-900">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default SkeletonBlock
