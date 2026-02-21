import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const { width, height } = this.scale

    // Sky gradient background
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4a90d9, 0x4a90d9, 1)
    bg.fillRect(0, 0, width, height)

    // Ground
    const ground = this.add.graphics()
    ground.fillStyle(0x5d8a3c, 1)
    ground.fillRect(0, height - 60, width, 60)
    ground.fillStyle(0x8bc34a, 1)
    ground.fillRect(0, height - 60, width, 12)

    // Title
    this.add
      .text(width / 2, height * 0.2, '🐦 Flappy Bird', {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1a5276',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height * 0.3, 'Tap or Click to Flap!', {
        fontSize: '18px',
        color: '#fffde7',
        stroke: '#333',
        strokeThickness: 2,
      })
      .setOrigin(0.5)

    // Animated bird preview
    const bird = this.add.graphics()
    bird.fillStyle(0x27ae60, 1)
    bird.fillCircle(width / 2, height * 0.48, 22)
    bird.fillStyle(0xffd700, 1)
    bird.fillTriangle(
      width / 2 + 18,
      height * 0.48,
      width / 2 + 32,
      height * 0.48 - 6,
      width / 2 + 32,
      height * 0.48 + 6,
    )
    bird.fillStyle(0xffffff, 1)
    bird.fillCircle(width / 2 + 8, height * 0.48 - 8, 6)
    bird.fillStyle(0x1a1a1a, 1)
    bird.fillCircle(width / 2 + 10, height * 0.48 - 8, 3)

    this.tweens.add({
      targets: bird,
      y: '-=12',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Play button
    const btnX = width / 2
    const btnY = height * 0.68
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x27ae60, 1)
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

    const startGame = () => {
      this.scene.start('GameScene')
    }

    btnBg.on('pointerdown', startGame)
    btnText.on('pointerdown', startGame)

    btnBg.on('pointerover', () => {
      btnBg.clear()
      btnBg.fillStyle(0x1e8449, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })
    btnBg.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x27ae60, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })

    // Instructions
    this.add
      .text(width / 2, height * 0.82, '🖱️ Click / 👆 Tap to jump\nAvoid the pipes!', {
        fontSize: '15px',
        color: '#fffde7',
        align: 'center',
        stroke: '#333',
        strokeThickness: 1,
      })
      .setOrigin(0.5)
  }
}
