import Phaser from 'phaser'

const BLOCK_HEIGHT = 30
const STARTING_WIDTH = 200
const MIN_WIDTH = 40
const BASE_SPEED = 200
const PERFECT_THRESHOLD = 6

const BLOCK_COLORS = [
  0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71,
  0x3498db, 0x9b59b6, 0xe91e63, 0x00bcd4,
]

interface Block {
  x: number
  y: number
  width: number
  color: number
  graphics: Phaser.GameObjects.Graphics
}

export class GameScene extends Phaser.Scene {
  private movingBlock: Phaser.GameObjects.Graphics | null = null
  private movingX = 0
  private movingWidth = STARTING_WIDTH
  private movingColor = 0
  private movingDir = 1
  private movingSpeed = BASE_SPEED
  private stackedBlocks: Block[] = []
  private score = 0
  private perfectCount = 0
  private scoreText!: Phaser.GameObjects.Text
  private isGameOver = false
  private canDrop = true
  private colorIndex = 0
  private viewportOffset = 0 // How much we've scrolled the "camera"
  private blocksContainer!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
    bg.fillRect(0, 0, width, height)

    this.blocksContainer = this.add.container(0, 0)

    this.score = 0
    this.perfectCount = 0
    this.isGameOver = false
    this.canDrop = true
    this.colorIndex = 0
    this.viewportOffset = 0

    // Score text
    this.scoreText = this.add
      .text(width / 2, 16, 'Score: 0', {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(10)

    // Place starting base block
    const baseY = height - BLOCK_HEIGHT - 20
    const baseBlock = this.addBlock(width / 2 - STARTING_WIDTH / 2, baseY, STARTING_WIDTH, 0x888888)
    this.stackedBlocks.push(baseBlock)

    this.spawnMovingBlock()

    // Input
    this.input.on('pointerdown', this.dropBlock, this)
    this.input.keyboard?.on('keydown-SPACE', this.dropBlock, this)
  }

  private addBlock(x: number, y: number, width: number, color: number): Block {
    const g = this.add.graphics()
    g.fillStyle(color, 1)
    g.fillRoundedRect(x, y, width, BLOCK_HEIGHT, 4)
    g.lineStyle(2, 0xffffff, 0.2)
    g.strokeRoundedRect(x, y, width, BLOCK_HEIGHT, 4)
    this.blocksContainer.add(g)
    return { x, y, width, color, graphics: g }
  }

  private spawnMovingBlock() {
    if (this.isGameOver) return

    const { width } = this.scale
    const topBlock = this.stackedBlocks[this.stackedBlocks.length - 1]
    const newY = topBlock.y - BLOCK_HEIGHT - 2

    this.movingWidth = topBlock.width
    this.movingColor = BLOCK_COLORS[this.colorIndex % BLOCK_COLORS.length]
    this.colorIndex++
    this.movingDir = Math.random() < 0.5 ? 1 : -1
    this.movingX = this.movingDir > 0 ? -this.movingWidth : width
    this.movingSpeed = BASE_SPEED + Math.floor(this.score / 5) * 20
    this.canDrop = true

    // Create moving block graphics
    if (this.movingBlock) {
      this.movingBlock.destroy()
    }
    this.movingBlock = this.add.graphics()
    this.movingBlock.setDepth(5)
    this.drawMovingBlock(newY)
  }

  private drawMovingBlock(y: number) {
    if (!this.movingBlock) return
    this.movingBlock.clear()
    this.movingBlock.fillStyle(this.movingColor, 1)
    this.movingBlock.fillRoundedRect(this.movingX, y, this.movingWidth, BLOCK_HEIGHT, 4)
    this.movingBlock.lineStyle(2, 0xffffff, 0.3)
    this.movingBlock.strokeRoundedRect(this.movingX, y, this.movingWidth, BLOCK_HEIGHT, 4)
  }

  private getMovingY(): number {
    if (this.stackedBlocks.length === 0) return 0
    const topBlock = this.stackedBlocks[this.stackedBlocks.length - 1]
    return topBlock.y - BLOCK_HEIGHT - 2
  }

  private dropBlock = () => {
    if (this.isGameOver || !this.canDrop) return
    this.canDrop = false

    const { width } = this.scale
    const topBlock = this.stackedBlocks[this.stackedBlocks.length - 1]
    const movingY = this.getMovingY()

    // Calculate overlap
    const movLeft = this.movingX
    const movRight = this.movingX + this.movingWidth
    const topLeft = topBlock.x
    const topRight = topBlock.x + topBlock.width

    const overlapLeft = Math.max(movLeft, topLeft)
    const overlapRight = Math.min(movRight, topRight)
    const overlapWidth = overlapRight - overlapLeft

    if (overlapWidth <= 0) {
      // No overlap → game over
      this.movingBlock?.destroy()
      this.movingBlock = null
      this.triggerGameOver()
      return
    }

    const isPerfect = Math.abs(movLeft - topLeft) <= PERFECT_THRESHOLD
    const landedX = isPerfect ? topLeft : overlapLeft
    const landedWidth = isPerfect ? topBlock.width : overlapWidth

    if (isPerfect) {
      // Perfect! bonus
      this.perfectCount++
      this.score += 5
      const txt = this.add
        .text(width / 2, movingY, 'Perfect! +5', {
          fontSize: '20px',
          color: '#f1c40f',
          fontStyle: 'bold',
          stroke: '#333',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(20)
      this.tweens.add({
        targets: txt,
        y: movingY - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => txt.destroy(),
      })
    }

    // Minimum width check
    if (landedWidth < MIN_WIDTH) {
      this.movingBlock?.destroy()
      this.movingBlock = null
      this.triggerGameOver()
      return
    }

    // Place new block
    this.movingBlock?.destroy()
    this.movingBlock = null

    const newBlock = this.addBlock(landedX, movingY, landedWidth, this.movingColor)
    this.stackedBlocks.push(newBlock)
    this.score++
    this.scoreText.setText(`Score: ${this.score}`)

    // Scroll view up if tower is getting tall
    const screenMidY = this.scale.height / 2
    if (movingY < screenMidY) {
      const shift = screenMidY - movingY
      this.viewportOffset += shift
      this.tweens.add({
        targets: this.blocksContainer,
        y: this.viewportOffset,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.spawnMovingBlock()
        },
      })
    } else {
      this.spawnMovingBlock()
    }
  }

  update(_time: number, delta: number) {
    if (this.isGameOver || !this.canDrop) return
    if (!this.movingBlock) return

    const { width } = this.scale
    const movingY = this.getMovingY()
    this.movingX += this.movingSpeed * this.movingDir * (delta / 1000)

    // Bounce off edges
    if (this.movingX + this.movingWidth > width + 20) {
      this.movingDir = -1
    } else if (this.movingX < -20) {
      this.movingDir = 1
    }

    this.drawMovingBlock(movingY)
  }

  private triggerGameOver() {
    if (this.isGameOver) return
    this.isGameOver = true
    window.dispatchEvent(
      new CustomEvent('stacktower:gameover', {
        detail: { score: this.score, perfectCount: this.perfectCount },
      }),
    )
  }
}
