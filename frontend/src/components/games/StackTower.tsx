import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { stackTowerConfig } from '../../lib/phaser/stacktower/config'

interface StackTowerProps {
  onGameOver: (score: number, perfectCount?: number) => void
}

export default function StackTower({ onGameOver }: StackTowerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      ...stackTowerConfig,
      parent: containerRef.current,
    }

    gameRef.current = new Phaser.Game(config)

    const handleGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number; perfectCount: number }>).detail
      onGameOver(detail.score, detail.perfectCount)
    }

    window.addEventListener('stacktower:gameover', handleGameOver)

    return () => {
      window.removeEventListener('stacktower:gameover', handleGameOver)
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
