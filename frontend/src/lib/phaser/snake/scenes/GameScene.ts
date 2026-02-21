import Phaser from 'phaser'

const CELL_SIZE = 20
const GRID_COLS = 20
const GRID_ROWS = 20
const INITIAL_SPEED = 150 // ms per move

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface Segment {
  col: number
  row: number
}

export class GameScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics
  private snake: Segment[] = []
  private food: Segment = { col: 0, row: 0 }
  private direction: Direction = 'RIGHT'
  private nextDirection: Direction = 'RIGHT'
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  private isGameOver = false
  private moveTimer = 0
  private moveInterval = INITIAL_SPEED
  // Swipe tracking
  private swipeStartX = 0
  private swipeStartY = 0

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width } = this.scale

    this.graphics = this.add.graphics()
    this.snake = [
      { col: 4, row: 10 },
      { col: 3, row: 10 },
      { col: 2, row: 10 },
    ]
    this.direction = 'RIGHT'
    this.nextDirection = 'RIGHT'
    this.score = 0
    this.isGameOver = false
    this.moveTimer = 0
    this.moveInterval = INITIAL_SPEED

    this.spawnFood()

    this.scoreText = this.add
      .text(width / 2, 8, 'Score: 0', {
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setDepth(10)

    // Keyboard controls
    this.input.keyboard?.on('keydown-UP', () => this.setDirection('UP'))
    this.input.keyboard?.on('keydown-DOWN', () => this.setDirection('DOWN'))
    this.input.keyboard?.on('keydown-LEFT', () => this.setDirection('LEFT'))
    this.input.keyboard?.on('keydown-RIGHT', () => this.setDirection('RIGHT'))
    this.input.keyboard?.on('keydown-W', () => this.setDirection('UP'))
    this.input.keyboard?.on('keydown-S', () => this.setDirection('DOWN'))
    this.input.keyboard?.on('keydown-A', () => this.setDirection('LEFT'))
    this.input.keyboard?.on('keydown-D', () => this.setDirection('RIGHT'))

    // Swipe controls
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      this.swipeStartX = ptr.x
      this.swipeStartY = ptr.y
    })
    this.input.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      const dx = ptr.x - this.swipeStartX
      const dy = ptr.y - this.swipeStartY
      const minSwipe = 30
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) {
          this.setDirection(dx > 0 ? 'RIGHT' : 'LEFT')
        }
      } else {
        if (Math.abs(dy) > minSwipe) {
          this.setDirection(dy > 0 ? 'DOWN' : 'UP')
        }
      }
    })

    this.drawGame()
  }

  private setDirection(dir: Direction) {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
    }
    if (dir !== opposites[this.direction]) {
      this.nextDirection = dir
    }
  }

  private spawnFood() {
    const occupied = new Set(this.snake.map((s) => `${s.col},${s.row}`))
    let col: number, row: number
    do {
      col = Phaser.Math.Between(0, GRID_COLS - 1)
      row = Phaser.Math.Between(1, GRID_ROWS - 1) // avoid top row (score)
    } while (occupied.has(`${col},${row}`))
    this.food = { col, row }
  }

  private drawGame() {
    const g = this.graphics
    const { width, height } = this.scale
    g.clear()

    // Background
    g.fillStyle(0x1a1a1a, 1)
    g.fillRect(0, 0, width, height)

    // Grid lines
    g.lineStyle(1, 0x333333, 0.4)
    for (let c = 0; c <= GRID_COLS; c++) {
      g.lineBetween(c * CELL_SIZE, 0, c * CELL_SIZE, height)
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      g.lineBetween(0, r * CELL_SIZE, width, r * CELL_SIZE)
    }

    // Food
    g.fillStyle(0xff0000, 1)
    g.fillCircle(
      this.food.col * CELL_SIZE + CELL_SIZE / 2,
      this.food.row * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
    )

    // Snake
    this.snake.forEach((seg, i) => {
      g.fillStyle(i === 0 ? 0x00ff00 : 0x00cc00, 1)
      g.fillRect(seg.col * CELL_SIZE + 1, seg.row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })
  }

  update(_time: number, delta: number) {
    if (this.isGameOver) return

    this.moveTimer += delta
    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer -= this.moveInterval
      this.moveSnake()
    }

    this.drawGame()
  }

  private moveSnake() {
    this.direction = this.nextDirection
    const head = this.snake[0]
    let newHead: Segment

    switch (this.direction) {
      case 'UP':    newHead = { col: head.col, row: head.row - 1 }; break
      case 'DOWN':  newHead = { col: head.col, row: head.row + 1 }; break
      case 'LEFT':  newHead = { col: head.col - 1, row: head.row }; break
      case 'RIGHT': newHead = { col: head.col + 1, row: head.row }; break
    }

    // Wall collision
    if (
      newHead.col < 0 || newHead.col >= GRID_COLS ||
      newHead.row < 0 || newHead.row >= GRID_ROWS
    ) {
      this.triggerGameOver()
      return
    }

    // Self collision
    if (this.snake.some((s) => s.col === newHead.col && s.row === newHead.row)) {
      this.triggerGameOver()
      return
    }

    this.snake.unshift(newHead)

    // Ate food?
    if (newHead.col === this.food.col && newHead.row === this.food.row) {
      this.score++
      this.scoreText.setText(`Score: ${this.score}`)
      this.spawnFood()
      // Speed up every 5 apples
      if (this.score % 5 === 0) {
        this.moveInterval = Math.max(60, this.moveInterval - 10)
      }
    } else {
      this.snake.pop()
    }
  }

  private triggerGameOver() {
    if (this.isGameOver) return
    this.isGameOver = true
    window.dispatchEvent(new CustomEvent('snake:gameover', { detail: { score: this.score } }))
  }
}
