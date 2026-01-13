import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg ${className} ${
        onClick ? 'cursor-pointer hover:border-gray-700 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
