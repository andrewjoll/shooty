import { Container, Graphics } from "pixi.js";

export default class HealthBar extends Container {
  background: Graphics;
  foreground: Graphics;

  maxHealth: number;
  currentHealth: number;

  constructor(currentHealth: number, maxHealth: number = 100) {
    super();

    this.zIndex = 100;

    this.maxHealth = maxHealth;
    this.currentHealth = currentHealth;

    this.background = new Graphics();
    this.foreground = new Graphics();

    this.addChild(this.background);
    this.addChild(this.foreground);

    this.updateBar();
  }

  updateBar() {
    const outerWidthWidth = 80;
    const innerWidth = outerWidthWidth * (this.currentHealth / this.maxHealth);
    const barHeight = 10;

    this.background.rect(
      -(outerWidthWidth * 0.5),
      0,
      outerWidthWidth,
      barHeight
    );
    this.background.stroke({ width: 2, color: 0x00ff00, alpha: 0.5 });

    this.foreground.rect(-(outerWidthWidth * 0.5), 0, innerWidth, barHeight);
    this.foreground.fill({ color: 0x00ff00, alpha: 0.5 });
  }

  setHealth(health: number) {
    this.currentHealth = health;
  }
}
