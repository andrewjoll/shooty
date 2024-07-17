import { Container, Graphics } from "pixi.js";
import InputManager from "../InputManager";

enum CursorState {
  Move = "move",
  Attack = "attack",
}

export default class Mouse extends Container {
  graphics: Graphics;
  state: CursorState;

  constructor() {
    super();

    this.state = CursorState.Move;

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    window.addEventListener("mousemove", (event) => {
      this.position.set(event.clientX, event.clientY);
    });

    InputManager.on("attack-start", () => {
      this.setState(CursorState.Attack);
    });

    InputManager.on("attack-end", () => {
      this.setState(CursorState.Move);
    });

    this.drawCursor();
  }

  setState(newState: CursorState) {
    if (newState != this.state) {
      this.state = newState;

      this.drawCursor();
    }
  }

  drawCursor() {
    this.graphics.clear();

    switch (this.state) {
      case CursorState.Attack:
        this.graphics.ellipse(0, 0, 48, 14);
        this.graphics.fill("rgba(255, 0, 0, 0.1)");
        this.graphics.stroke({ color: "rgba(255, 0, 0, 0.5)", width: 3 });
        break;

      case CursorState.Move:
        this.graphics.ellipse(0, 0, 24, 7);
        this.graphics.fill("rgba(255, 255, 255, 0.1)");
        this.graphics.stroke({ color: "rgba(255, 255, 255, 0.5)", width: 1 });
        break;
    }
  }

  static assetBundle() {
    return [{ alias: "cursor", src: "./assets/Cursor.png" }];
  }
}
