import Phaser from 'phaser'

const PIPE_SPEED = 200
const PIPE_GAP = 150
const PIPE_INTERVAL = 2000 // ms
const BIRD_JUMP_VELOCITY = -380
const GROUND_HEIGHT = 60

interface Pipe {
  top: Phaser.GameObjects.Graphics
  bottom: Phaser.GameObjects.Graphics
  x: number
  scored: boolean
  topHeight: number
  bottomY: number
}

export class GameScene extends Phaser.Scene {
  private bird!: Phaser.GameObjects.Graphics
  private birdBody!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  private pipes: Pipe[] = []
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  private isGameOver = false
  private groundGraphics!: Phaser.GameObjects.Graphics
  private lastPipeTime = 0
  private bgGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Background
    this.bgGraphics = this.add.graphics()
    this.bgGraphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4a90d9, 0x4a90d9, 1)
    this.bgGraphics.fillRect(0, 0, width, height)

    // Ground
    this.groundGraphics = this.add.graphics()
    this.drawGround()

    // Bird (invisible physics body sized to visual)
    this.birdBody = this.physics.add
      .image(80, height / 2, '__DEFAULT')
      .setVisible(false)
      .setDisplaySize(34, 34)
      .setCollideWorldBounds(true)

    this.birdBody.setGravityY(0) // Use world gravity from config

    // Bird visual on top of physics body
    this.bird = this.add.graphics()
    this.drawBird()

    // Score text
    this.scoreText = this.add
      .text(width / 2, 24, '0', {
        fontSize: '40px',
        color: '#ffffff',
        stroke: '#1a5276',
        strokeThickness: 4,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)

    this.pipes = []
    this.score = 0
    this.isGameOver = false
    this.lastPipeTime = 0

    // Input: tap/click/space to jump
    this.input.on('pointerdown', this.jump, this)
    this.input.keyboard?.on('keydown-SPACE', this.jump, this)
    this.input.keyboard?.on('keydown-UP', this.jump, this)

    // Spawn first pipe after a short delay
    this.time.delayedCall(1200, () => {
      if (!this.isGameOver) this.spawnPipe()
    })
  }

  private drawBird() {
    this.bird.clear()
    const x = this.birdBody.x
    const y = this.birdBody.y
    // Body
    this.bird.fillStyle(0x27ae60, 1)
    this.bird.fillCircle(x, y, 17)
    // Wing
    this.bird.fillStyle(0x1e8449, 1)
    this.bird.fillEllipse(x - 4, y + 4, 18, 10)
    // Beak
    this.bird.fillStyle(0xffd700, 1)
    this.bird.fillTriangle(x + 14, y, x + 26, y - 5, x + 26, y + 5)
    // Eye white
    this.bird.fillStyle(0xffffff, 1)
    this.bird.fillCircle(x + 6, y - 6, 6)
    // Pupil
    this.bird.fillStyle(0x1a1a1a, 1)
    this.bird.fillCircle(x + 8, y - 6, 3)
  }

  private drawGround() {
    const { width, height } = this.scale
    this.groundGraphics.clear()
    this.groundGraphics.fillStyle(0x5d8a3c, 1)
    this.groundGraphics.fillRect(0, height - GROUND_HEIGHT, width, GROUND_HEIGHT)
    this.groundGraphics.fillStyle(0x8bc34a, 1)
    this.groundGraphics.fillRect(0, height - GROUND_HEIGHT, width, 12)
  }

  private spawnPipe() {
    if (this.isGameOver) return
    const { width, height } = this.scale

    const minTopHeight = 60
    const maxTopHeight = height - GROUND_HEIGHT - PIPE_GAP - 60
    const topHeight = Phaser.Math.Between(minTopHeight, maxTopHeight)
    const bottomY = topHeight + PIPE_GAP
    const bottomHeight = height - GROUND_HEIGHT - bottomY
    const pipeX = width + 30

    const topPipe = this.add.graphics()
    topPipe.fillStyle(0x27ae60, 1)
    topPipe.fillRect(0, 0, 52, topHeight)
    topPipe.fillStyle(0x1e8449, 1)
    topPipe.fillRect(-4, topHeight - 20, 60, 20)
    topPipe.lineStyle(2, 0x145a32, 1)
    topPipe.strokeRect(0, 0, 52, topHeight)
    topPipe.x = pipeX
    topPipe.y = 0

    const bottomPipe = this.add.graphics()
    bottomPipe.fillStyle(0x27ae60, 1)
    bottomPipe.fillRect(0, 0, 52, bottomHeight)
    bottomPipe.fillStyle(0x1e8449, 1)
    bottomPipe.fillRect(-4, 0, 60, 20)
    bottomPipe.lineStyle(2, 0x145a32, 1)
    bottomPipe.strokeRect(0, 0, 52, bottomHeight)
    bottomPipe.x = pipeX
    bottomPipe.y = bottomY

    this.pipes.push({ top: topPipe, bottom: bottomPipe, x: pipeX, scored: false, topHeight, bottomY })
  }

  private jump() {
    if (this.isGameOver) return
    this.birdBody.setVelocityY(BIRD_JUMP_VELOCITY)
  }

  private checkCollision(pipe: Pipe): boolean {
    const bx = this.birdBody.x
    const by = this.birdBody.y
    const br = 14
    const pLeft = pipe.x
    const pRight = pipe.x + 54

    if (bx + br > pLeft && bx - br < pRight) {
      if (by - br < pipe.topHeight || by + br > pipe.bottomY) {
        return true
      }
    }
    return false
  }

  update(time: number) {
    if (this.isGameOver) return

    const { height } = this.scale
    const dt = this.game.loop.delta / 1000

    // Move pipes
    for (const pipe of this.pipes) {
      pipe.x -= PIPE_SPEED * dt
      pipe.top.x = pipe.x
      pipe.bottom.x = pipe.x
    }

    // Remove off-screen pipes
    this.pipes = this.pipes.filter((p) => {
      if (p.x < -80) {
        p.top.destroy()
        p.bottom.destroy()
        return false
      }
      return true
    })

    // Spawn new pipes
    if (time - this.lastPipeTime > PIPE_INTERVAL) {
      this.spawnPipe()
      this.lastPipeTime = time
    }

    // Update bird visual to follow physics body
    this.drawBird()

    // Score: pipe passed
    for (const pipe of this.pipes) {
      if (!pipe.scored && pipe.x + 52 < this.birdBody.x - 17) {
        pipe.scored = true
        this.score++
        this.scoreText.setText(String(this.score))
      }
    }

    // Collision: ground
    if (this.birdBody.y + 17 >= height - GROUND_HEIGHT) {
      this.triggerGameOver()
      return
    }

    // Collision: ceiling
    if (this.birdBody.y - 17 <= 0) {
      this.birdBody.setVelocityY(0)
      this.birdBody.y = 17
    }

    // Collision: pipes
    for (const pipe of this.pipes) {
      if (this.checkCollision(pipe)) {
        this.triggerGameOver()
        return
      }
    }
  }

  private triggerGameOver() {
    if (this.isGameOver) return
    this.isGameOver = true

    this.birdBody.setVelocityY(0)
    this.birdBody.setGravityY(-800)

    // Notify React via custom event
    const gameOverEvent = new CustomEvent('flappybird:gameover', {
      detail: { score: this.score },
    })
    window.dispatchEvent(gameOverEvent)
  }
}
