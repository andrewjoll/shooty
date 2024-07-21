import { Container, Graphics, Point, Text, TextStyle } from "pixi.js";
import InputManager from "../InputManager";
import Viewport from "../Viewport";

enum CursorState {
  Move = "move",
  Attack = "attack",
}

export default class Mouse extends Container {
  graphics: Graphics;
  state: CursorState;
  viewport: Viewport;
  text: Text;

  get worldPosition() {
    return new Point(
      this.position.x - this.viewport.position.x,
      this.position.y - this.viewport.position.y
    );
  }

  get viewPosition() {
    return this.position;
  }

  constructor(viewport: Viewport) {
    super();

    this.position.set(window.innerWidth / 2, window.innerHeight / 2);

    this.viewport = viewport;
    this.state = CursorState.Move;

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.text = new Text({
      style: new TextStyle({ fontSize: 14, fill: "rgba(255, 255, 255, 0.5)" }),
    });
    this.addChild(this.text);

    window.addEventListener("mousemove", (event) => {
      this.position.set(event.clientX, event.clientY);
    });

    InputManager.on("attack-start", () => {
      this.setState(CursorState.Attack);
    });

    InputManager.on("attack-end", () => {
      this.setState(CursorState.Move);
    });
  }

  setState(newState: CursorState) {
    if (newState != this.state) {
      this.state = newState;
    }
  }

  update() {
    this.text.text = `v:\t${this.position.x}, ${
      this.position.y
    }\nw:\t${this.worldPosition.x.toFixed()}, ${this.worldPosition.y.toFixed()}`;

    this.text.position.set(
      -this.viewport.position.x + 20,
      -this.viewport.position.y - this.text.height - 10
    );

    this.graphics.clear();

    switch (this.state) {
      case CursorState.Attack:
        this.graphics.ellipse(
          -this.viewport.position.x,
          -this.viewport.position.y,
          48,
          14
        );
        this.graphics.fill("rgba(255, 0, 0, 0.1)");
        this.graphics.stroke({ color: "rgba(255, 0, 0, 0.5)", width: 3 });
        break;

      case CursorState.Move:
        this.graphics.ellipse(
          -this.viewport.position.x,
          -this.viewport.position.y,
          24,
          7
        );
        this.graphics.fill("rgba(255, 255, 255, 0.1)");
        this.graphics.stroke({ color: "rgba(255, 255, 255, 0.5)", width: 1 });
        break;
    }
  }

  static assetBundle() {
    return [{ alias: "cursor", src: "./assets/Cursor.png" }];
  }
}
