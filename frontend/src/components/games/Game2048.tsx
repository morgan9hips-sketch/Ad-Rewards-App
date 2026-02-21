import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { game2048Config } from '../../lib/phaser/game2048/config'

interface Game2048Props {
  onGameOver: (score: number) => void
  onWin?: (score: number) => void
}

export default function Game2048({ onGameOver, onWin }: Game2048Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      ...game2048Config,
      parent: containerRef.current,
    }

    gameRef.current = new Phaser.Game(config)

    const handleGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number }>).detail
      onGameOver(detail.score)
    }

    const handleWin = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number }>).detail
      onWin?.(detail.score)
    }

    window.addEventListener('game2048:gameover', handleGameOver)
    window.addEventListener('game2048:win', handleWin)

    return () => {
      window.removeEventListener('game2048:gameover', handleGameOver)
      window.removeEventListener('game2048:win', handleWin)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [onGameOver, onWin])

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ touchAction: 'none' }}
    />
  )
}
