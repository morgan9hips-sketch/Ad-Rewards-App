import { useEffect, useRef, useState } from 'react'

interface GameCanvasProps {
  onGameOver: (score: number, completed: boolean) => void
  onScoreChange: (score: number) => void
  lives: number
}

interface Bubble {
  x: number
  y: number
  radius: number
  color: string
  dy: number
}

export default function GameCanvas({
  onGameOver,
  onScoreChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const bubblesRef = useRef<Bubble[]>([])
  const animationFrameRef = useRef<number>()
  const lastSpawnTimeRef = useRef<number>(0)

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600
  const BUBBLE_RADIUS = 20
  const SPAWN_INTERVAL = 1500 // milliseconds
  const BUBBLE_SPEED = 2
  const WIN_SCORE = 50

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    const spawnBubble = (currentTime: number) => {
      if (currentTime - lastSpawnTimeRef.current > SPAWN_INTERVAL) {
        const bubble: Bubble = {
          x: Math.random() * (CANVAS_WIDTH - BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
          y: -BUBBLE_RADIUS,
          radius: BUBBLE_RADIUS,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          dy: BUBBLE_SPEED,
        }
        bubblesRef.current.push(bubble)
        lastSpawnTimeRef.current = currentTime
      }
    }

    const drawBubble = (bubble: Bubble) => {
      ctx.beginPath()
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
      ctx.fillStyle = bubble.color
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.closePath()

      // Add shine effect
      ctx.beginPath()
      ctx.arc(bubble.x - bubble.radius / 4, bubble.y - bubble.radius / 4, bubble.radius / 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.fill()
      ctx.closePath()
    }

    const update = (currentTime: number) => {
      if (!isPlaying) return

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw background
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Spawn new bubbles
      spawnBubble(currentTime)

      // Update and draw bubbles
      const bubbles = bubblesRef.current
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i]
        bubble.y += bubble.dy

        // Remove bubbles that went off screen (game over condition)
        if (bubble.y - bubble.radius > CANVAS_HEIGHT) {
          bubbles.splice(i, 1)
          // Lost a bubble - game over
          setIsPlaying(false)
          onGameOver(score, score >= WIN_SCORE)
          return
        } else {
          drawBubble(bubble)
        }
      }

      // Check for win condition
      if (score >= WIN_SCORE && isPlaying) {
        setIsPlaying(false)
        onGameOver(score, true)
        return
      }

      animationFrameRef.current = requestAnimationFrame(update)
    }

    animationFrameRef.current = requestAnimationFrame(update)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, score, onGameOver])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a bubble
    const bubbles = bubblesRef.current
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i]
      const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2)

      if (distance < bubble.radius) {
        // Hit! Remove bubble and increase score
        bubbles.splice(i, 1)
        const newScore = score + 1
        setScore(newScore)
        onScoreChange(newScore)
        break
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          🎯 Bubble Popper
        </h2>
        <p className="text-sm text-gray-400 mb-4 text-center">
          Click bubbles before they fall! Score {WIN_SCORE} to win 10 coins!
        </p>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="border-4 border-purple-500 rounded-lg cursor-crosshair"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            {isPlaying ? '🎮 Click bubbles to pop them!' : '⏸️ Game paused'}
          </p>
        </div>
      </div>
    </div>
  )
}
