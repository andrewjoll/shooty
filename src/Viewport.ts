import { Container, Graphics, Point } from "pixi.js";
import Mouse from "./entities/Mouse";
import GameTime from "./GameTime";
import { clamp } from "./utils";
import { quadOut } from "./easing";

export default class Viewport {
  stage: Container;

  border = 100;
  worldWidth: number;
  worldHeight: number;

  grid: Graphics;

  get width() {
    return window.innerWidth;
  }

  get height() {
    return window.innerHeight;
  }

  get position() {
    return new Point(this.stage.position.x, this.stage.position.y);
  }

  constructor(stage: Container, worldWidth: number, worldHeight: number) {
    this.stage = stage;

    this.stage.position.set(
      -(worldWidth * 0.5 - window.innerWidth * 0.5),
      -(worldHeight * 0.5 - window.innerHeight * 0.5)
    );

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.grid = new Graphics();
    this.stage.addChild(this.grid);

    const gridStepX = 100;
    const gridStepY = 100;
    const gridStepsX = worldWidth / gridStepX;
    const gridStepsY = worldHeight / gridStepY;

    for (let x = 0; x <= gridStepsX; x++) {
      this.grid.moveTo(x * gridStepX, 0);
      this.grid.lineTo(x * gridStepX, worldHeight);
      this.grid.stroke({ color: "rgba(255, 255, 255, 0.2)", width: 1 });
    }

    for (let y = 0; y <= gridStepsY; y++) {
      this.grid.moveTo(0, y * gridStepY);
      this.grid.lineTo(worldWidth, y * gridStepY);
      this.grid.stroke({ color: "rgba(255, 255, 255, 0.1)", width: 1 });
    }
  }

  update(time: GameTime, mouse: Mouse) {
    const velocity = 0.75 * time.deltaMs;

    let moveX = 0;
    let moveY = 0;

    // right
    if (mouse.x > this.width - this.border) {
      moveX -= this.border - (window.innerWidth - mouse.x);
    }

    // left
    if (mouse.x < this.border) {
      moveX -= mouse.x - this.border;
    }

    // up
    if (mouse.y < this.border) {
      moveY -= mouse.y - this.border;
    }

    // down
    if (mouse.y > this.height - this.border) {
      moveY -= this.border - (window.innerHeight - mouse.y);
    }

    const signX = Math.sign(moveX);
    const signY = Math.sign(moveY);

    const easeX = quadOut(Math.abs(moveX) / this.border);
    const easeY = quadOut(Math.abs(moveY) / this.border);

    const easedMoveX = easeX * velocity * signX;
    const easedMoveY = easeY * velocity * signY;

    let newX = this.stage.position.x + easedMoveX;
    let newY = this.stage.position.y + easedMoveY;

    const margin = 100;

    newX = clamp(newX, -(this.worldWidth - window.innerWidth) - margin, margin);
    newY = clamp(
      newY,
      -(this.worldHeight - window.innerHeight) - margin,
      margin
    );

    this.stage.position.set(newX, newY);
  }
}
