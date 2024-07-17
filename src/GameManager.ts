export enum GameState {
  Menu = "menu",
  Level = "level",
}

export enum LevelState {
  Active = "active",
  Failed = "failed",
  Paused = "paused",
}

export default class GameManager {
  state: GameState;
  levelState: LevelState;

  constructor() {
    this.state = GameState.Level;
    this.levelState = LevelState.Active;
  }
}
