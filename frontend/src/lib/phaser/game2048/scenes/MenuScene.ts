import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const { width, height } = this.scale

    // Background
    const bg = this.add.graphics()
    bg.fillStyle(0xbbada0, 1)
    bg.fillRect(0, 0, width, height)

    // Title
    this.add
      .text(width / 2, height * 0.15, '2048', {
        fontSize: '60px',
        color: '#776e65',
        fontStyle: 'bold',
        backgroundColor: '#edc22e',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)

    // Subtitle
    this.add
      .text(width / 2, height * 0.33, 'Merge tiles to reach 2048!', {
        fontSize: '18px',
        color: '#776e65',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // Sample tiles preview
    const tileColors: Record<number, number> = {
      2: 0xeee4da, 4: 0xede0c8, 8: 0xf2b179, 16: 0xf59563,
    }
    const tileValues = [2, 4, 8, 16]
    const tileSize = 60
    const startX = width / 2 - (tileSize * 2 + 12)
    const previewY = height * 0.5

    const preview = this.add.graphics()
    tileValues.forEach((val, i) => {
      const tx = startX + i * (tileSize + 8)
      preview.fillStyle(tileColors[val], 1)
      preview.fillRoundedRect(tx, previewY - tileSize / 2, tileSize, tileSize, 6)
      this.add
        .text(tx + tileSize / 2, previewY, String(val), {
          fontSize: '20px',
          color: val <= 4 ? '#776e65' : '#f9f6f2',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    })

    // Play button
    const btnX = width / 2
    const btnY = height * 0.72
    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x8f7a66, 1)
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
      btnBg.fillStyle(0x7a6656, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })
    btnBg.on('pointerout', () => {
      btnBg.clear()
      btnBg.fillStyle(0x8f7a66, 1)
      btnBg.fillRoundedRect(btnX - 80, btnY - 28, 160, 56, 14)
    })

    // Instructions
    this.add
      .text(width / 2, height * 0.87, '⬆⬇⬅➡ Arrow keys / Swipe to merge', {
        fontSize: '13px',
        color: '#776e65',
        align: 'center',
      })
      .setOrigin(0.5)
  }
}
