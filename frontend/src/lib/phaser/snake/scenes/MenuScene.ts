import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const { width, height } = this.scale

    // Background
    const bg = this.add.graphics()
    bg.fillStyle(0x1a1a1a, 1)
    bg.fillRect(0, 0, width, height)

    // Draw subtle grid
    bg.lineStyle(1, 0x333333, 0.5)
    for (let x = 0; x <= width; x += 20) {
      bg.lineBetween(x, 0, x, height)
    }
    for (let y = 0; y <= height; y += 20) {
      bg.lineBetween(0, y, width, y)
    }

    // Title
    this.add
      .text(width / 2, height * 0.18, '🐍 Snake', {
        fontSize: '38px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#003300',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Snake preview animation
    const snakeGraphics = this.add.graphics()
    const segments = [
      { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 },
      { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 },
    ]
    segments.forEach((seg, i) => {
      snakeGraphics.fillStyle(i === 0 ? 0x00ff00 : 0x00cc00, 1)
      snakeGraphics.fillRect(seg.x * 20 + 1, seg.y * 20 + 1, 18, 18)
    })
    // Food
    snakeGraphics.fillStyle(0xff0000, 1)
    snakeGraphics.fillCircle(12 * 20 + 10, 10 * 20 + 10, 8)

    this.tweens.add({
      targets: snakeGraphics,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Play button
    const btnX = width / 2
    const btnY = height * 0.7
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x00cc00, 1)
    btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)

    const btnText = this.add
      .text(btnX, btnY, '▶  Play Now', {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    btnText.setInteractive({ useHandCursor: true })
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(btnX - 80, btnY - 28, 160, 56),
      Phaser.Geom.Rectangle.Contains,
    )

    const startGame = () => this.scene.start('GameScene')

    btnBg.on('pointerdown', startGame)
    btnText.on('pointerdown', startGame)
    btnBg.on('pointerover', () => {
      btnBg.clear()
      btnBg.fillStyle(0x009900, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })
    btnBg.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x00cc00, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })

    // Instructions
    this.add
      .text(width / 2, height * 0.86, '⬆⬇⬅➡ Arrow keys / Swipe to move\nEat apples to grow!', {
        fontSize: '13px',
        color: '#aaaaaa',
        align: 'center',
      })
      .setOrigin(0.5)
  }
}
