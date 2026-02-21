import Phaser from 'phaser'

const GRID_SIZE = 4
const TILE_SIZE = 80
const TILE_GAP = 10
const BOARD_PADDING = 15
const BOARD_SIZE = GRID_SIZE * TILE_SIZE + (GRID_SIZE + 1) * TILE_GAP

const TILE_COLORS: Record<number, number> = {
  0: 0xcdc1b4,
  2: 0xeee4da,
  4: 0xede0c8,
  8: 0xf2b179,
  16: 0xf59563,
  32: 0xf67c5f,
  64: 0xf65e3b,
  128: 0xedcf72,
  256: 0xedcc61,
  512: 0xedc850,
  1024: 0xedc53f,
  2048: 0xedc22e,
}

type Grid = number[][]

export class GameScene extends Phaser.Scene {
  private grid: Grid = []
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  private boardGraphics!: Phaser.GameObjects.Graphics
  private tileTexts: Phaser.GameObjects.Text[][] = []
  private isGameOver = false
  private hasWon = false
  private swipeStartX = 0
  private swipeStartY = 0
  private boardOffsetX = 0
  private boardOffsetY = 0
  private isAnimating = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Center board
    this.boardOffsetX = (width - BOARD_SIZE) / 2
    this.boardOffsetY = (height - BOARD_SIZE) / 2 + 20

    this.grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
    this.score = 0
    this.isGameOver = false
    this.hasWon = false
    this.isAnimating = false

    // Background
    const bg = this.add.graphics()
    bg.fillStyle(0xbbada0, 1)
    bg.fillRect(0, 0, width, height)

    // Board
    this.boardGraphics = this.add.graphics()
    this.boardGraphics.fillStyle(0xbbada0, 1)
    this.boardGraphics.fillRoundedRect(
      this.boardOffsetX - BOARD_PADDING,
      this.boardOffsetY - BOARD_PADDING,
      BOARD_SIZE + BOARD_PADDING * 2,
      BOARD_SIZE + BOARD_PADDING * 2,
      8,
    )

    // Score
    this.scoreText = this.add
      .text(width / 2, this.boardOffsetY - BOARD_PADDING - 26, 'Score: 0', {
        fontSize: '20px',
        color: '#776e65',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 1)

    // Init tile text objects
    this.tileTexts = Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (__, col) =>
        this.add
          .text(
            this.boardOffsetX + col * (TILE_SIZE + TILE_GAP) + TILE_GAP + TILE_SIZE / 2,
            this.boardOffsetY + row * (TILE_SIZE + TILE_GAP) + TILE_GAP + TILE_SIZE / 2,
            '',
            { fontSize: '28px', color: '#776e65', fontStyle: 'bold' },
          )
          .setOrigin(0.5)
          .setDepth(2),
      ),
    )

    this.addRandomTile()
    this.addRandomTile()
    this.drawBoard()

    // Keyboard
    this.input.keyboard?.on('keydown-UP',    () => this.handleMove('UP'))
    this.input.keyboard?.on('keydown-DOWN',  () => this.handleMove('DOWN'))
    this.input.keyboard?.on('keydown-LEFT',  () => this.handleMove('LEFT'))
    this.input.keyboard?.on('keydown-RIGHT', () => this.handleMove('RIGHT'))

    // Swipe
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      this.swipeStartX = ptr.x
      this.swipeStartY = ptr.y
    })
    this.input.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      const dx = ptr.x - this.swipeStartX
      const dy = ptr.y - this.swipeStartY
      const minSwipe = 30
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) this.handleMove(dx > 0 ? 'RIGHT' : 'LEFT')
      } else {
        if (Math.abs(dy) > minSwipe) this.handleMove(dy > 0 ? 'DOWN' : 'UP')
      }
    })
  }

  private addRandomTile() {
    const empty: { row: number; col: number }[] = []
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === 0) empty.push({ row: r, col: c })
      }
    }
    if (empty.length === 0) return
    const { row, col } = empty[Phaser.Math.Between(0, empty.length - 1)]
    this.grid[row][col] = Math.random() < 0.9 ? 2 : 4
  }

  private drawBoard() {
    const g = this.boardGraphics
    g.clear()

    // Board background
    g.fillStyle(0xbbada0, 1)
    g.fillRoundedRect(
      this.boardOffsetX - BOARD_PADDING,
      this.boardOffsetY - BOARD_PADDING,
      BOARD_SIZE + BOARD_PADDING * 2,
      BOARD_SIZE + BOARD_PADDING * 2,
      8,
    )

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const val = this.grid[row][col]
        const tx = this.boardOffsetX + col * (TILE_SIZE + TILE_GAP) + TILE_GAP
        const ty = this.boardOffsetY + row * (TILE_SIZE + TILE_GAP) + TILE_GAP
        const color = TILE_COLORS[val] ?? 0x3d3a33

        g.fillStyle(color, 1)
        g.fillRoundedRect(tx, ty, TILE_SIZE, TILE_SIZE, 6)

        const txt = this.tileTexts[row][col]
        if (val > 0) {
          txt.setText(String(val))
          txt.setColor(val <= 4 ? '#776e65' : '#f9f6f2')
          const fontSize = val >= 1024 ? '20px' : val >= 128 ? '24px' : '28px'
          txt.setFontSize(parseInt(fontSize))
        } else {
          txt.setText('')
        }
      }
    }
  }

  private cloneGrid(): Grid {
    return this.grid.map((row) => [...row])
  }

  private gridsEqual(a: Grid, b: Grid): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (a[r][c] !== b[r][c]) return false
      }
    }
    return true
  }

  private handleMove(dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    if (this.isGameOver || this.isAnimating) return

    const before = this.cloneGrid()
    let gained = 0

    if (dir === 'LEFT') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const [row, pts] = this.slideLeft(this.grid[r])
        this.grid[r] = row
        gained += pts
      }
    } else if (dir === 'RIGHT') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const [row, pts] = this.slideLeft([...this.grid[r]].reverse())
        this.grid[r] = row.reverse()
        gained += pts
      }
    } else if (dir === 'UP') {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = this.grid.map((row) => row[c])
        const [result, pts] = this.slideLeft(col)
        result.forEach((val, r) => { this.grid[r][c] = val })
        gained += pts
      }
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = this.grid.map((row) => row[c]).reverse()
        const [result, pts] = this.slideLeft(col)
        const reversed = result.reverse()
        reversed.forEach((val, r) => { this.grid[r][c] = val })
        gained += pts
      }
    }

    if (this.gridsEqual(before, this.grid)) return

    this.score += gained
    this.scoreText.setText(`Score: ${this.score}`)

    // Check win
    if (!this.hasWon) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (this.grid[r][c] === 2048) {
            this.hasWon = true
            window.dispatchEvent(new CustomEvent('game2048:win', { detail: { score: this.score } }))
          }
        }
      }
    }

    this.addRandomTile()
    this.drawBoard()

    if (this.checkGameOver()) {
      this.isGameOver = true
      window.dispatchEvent(new CustomEvent('game2048:gameover', { detail: { score: this.score } }))
    }
  }

  private slideLeft(row: number[]): [number[], number] {
    const filtered = row.filter((v) => v !== 0)
    let points = 0
    const merged: number[] = []
    let i = 0
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const val = filtered[i] * 2
        merged.push(val)
        points += val
        i += 2
      } else {
        merged.push(filtered[i])
        i++
      }
    }
    while (merged.length < GRID_SIZE) merged.push(0)
    return [merged, points]
  }

  private checkGameOver(): boolean {
    // Any empty cell?
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === 0) return false
      }
    }
    // Any adjacent merge possible?
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const v = this.grid[r][c]
        if (c + 1 < GRID_SIZE && this.grid[r][c + 1] === v) return false
        if (r + 1 < GRID_SIZE && this.grid[r + 1][c] === v) return false
      }
    }
    return true
  }
}
