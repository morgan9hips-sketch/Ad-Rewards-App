import { ReactNode } from 'react'

interface GameContainerProps {
  title: string
  score?: number
  onClose: () => void
  children: ReactNode
}

export default function GameContainer({ title, score, onClose, children }: GameContainerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/90 border-b border-gray-800">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">{title}</h2>
        {score !== undefined ? (
          <span className="text-yellow-400 font-bold text-sm">Score: {score}</span>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ touchAction: 'none' }}>
        {children}
      </div>
    </div>
  )
}
