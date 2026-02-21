import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { snakeConfig } from '../../lib/phaser/snake/config'

interface SnakeProps {
  onGameOver: (score: number) => void
}

export default function Snake({ onGameOver }: SnakeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      ...snakeConfig,
      parent: containerRef.current,
    }

    gameRef.current = new Phaser.Game(config)

    const handleGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number }>).detail
      onGameOver(detail.score)
    }

    window.addEventListener('snake:gameover', handleGameOver)

    return () => {
      window.removeEventListener('snake:gameover', handleGameOver)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [onGameOver])

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ touchAction: 'none' }}
    />
  )
}
