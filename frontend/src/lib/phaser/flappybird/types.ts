export interface GameScore {
  score: number
  timestamp: number
}

export interface GameConfig {
  width: number
  height: number
  gravity: number
  jumpVelocity: number
  pipeGap: number
  pipeSpeed: number
}
