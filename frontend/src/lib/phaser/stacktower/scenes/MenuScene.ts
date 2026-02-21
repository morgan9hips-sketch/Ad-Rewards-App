import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const { width, height } = this.scale

    // Background gradient
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
    bg.fillRect(0, 0, width, height)

    // Title
    this.add
      .text(width / 2, height * 0.14, '🏗️ Stack Tower', {
        fontSize: '34px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000033',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Tower preview
    const preview = this.add.graphics()
    const blockColors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x3498db, 0x9b59b6]
    const bw = 140
    const bh = 22
    const baseY = height * 0.68

    blockColors.forEach((color, i) => {
      const w = bw - i * 6
      const x = (width - w) / 2
      const y = baseY - i * (bh + 3)
      preview.fillStyle(color, 1)
      preview.fillRoundedRect(x, y, w, bh, 4)
    })

    this.tweens.add({
      targets: preview,
      y: '-=6',
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Play button
    const btnX = width / 2
    const btnY = height * 0.82
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x3498db, 1)
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
      btnBg.fillStyle(0x2980b9, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })
    btnBg.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x3498db, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })

    // Instructions
    this.add
      .text(width / 2, height * 0.93, '👆 Tap / Click to drop block', {
        fontSize: '13px',
        color: '#aaaacc',
        align: 'center',
      })
      .setOrigin(0.5)
  }
}
