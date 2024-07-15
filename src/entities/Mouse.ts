import { Container, Graphics } from "pixi.js";

export default class Mouse extends Container {
  constructor() {
    super();

    const graphics = new Graphics();
    graphics.ellipse(0, 0, 24, 7);
    graphics.fill("rgba(255, 255, 255, 0.1)");
    graphics.stroke("rgba(255, 255, 255, 0.5)");

    this.addChild(graphics);

    window.addEventListener("mousemove", (event) => {
      this.position.set(event.clientX, event.clientY);
    });
  }

  static assetBundle() {
    return [{ alias: "cursor", src: "./assets/Cursor.png" }];
  }
}
