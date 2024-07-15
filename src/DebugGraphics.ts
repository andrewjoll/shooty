import { Container, Graphics } from "pixi.js";

class DebugGraphics {
  container: Container;

  constructor(container: Container) {
    this.container = container;

    console.log("DebugGraphics");
  }

  line(x1: number, y1: number, x2: number, y2: number): DebugLine {
    const line = new DebugLine(x1, y1, x2, y2);

    this.container.addChild(line);

    return line;
  }
}

export class DebugLine extends Graphics {
  x1: number = 0;
  y1: number = 0;

  x2: number = 0;
  y2: number = 0;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    super();

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.drawLine();
  }

  setPoints(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.drawLine();
  }

  drawLine() {
    this.clear();
    this.moveTo(this.x1, this.y1);
    this.lineTo(this.x2, this.y2);
    this.stroke("rgba(255, 255, 255, 0.5)");
  }
}

let instance: DebugGraphics;

export const initDebugGraphics = (container: Container): void => {
  instance = new DebugGraphics(container);
};

export { instance as DebugGraphics };
