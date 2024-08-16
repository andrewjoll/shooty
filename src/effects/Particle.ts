import { Graphics, Point } from "pixi.js";
import GameTime from "../GameTime";

export enum ParticleState {
  Inactive = "inactive",
  Dead = "dead",
  Active = "active",
}

export default class Particle extends Graphics {
  target: Point;
  velocity: number;
  velocityDecay: number;

  alphaDecay: number;
  scaleDecay: number;
  state: ParticleState;

  constructor() {
    super();

    this.state = ParticleState.Inactive;

    this.target = Point.shared;

    this.velocity = 1;
    this.velocityDecay = 0;

    this.alpha = 0;
    this.alphaDecay = 0;

    this.scaleDecay = 0;
  }

  update(time: GameTime) {
    if (this.state !== ParticleState.Active) {
      return;
    }

    const delta = this.target.subtract(this.position);
    const distance = delta.magnitude();

    if (distance < 10 || this.alpha <= 0 || this.velocity <= 0) {
      this.state = ParticleState.Dead;
      this.alpha = 0;
      return;
    }

    const angleToTarget = Math.atan2(delta.y, delta.x);
    const deltaNormalized = delta.normalize();

    this.rotation = angleToTarget;
    this.position.set(
      this.position.x + deltaNormalized.x * this.velocity * time.deltaMs,
      this.position.y + deltaNormalized.y * this.velocity * time.deltaMs
    );

    this.alpha = Math.max(
      this.alpha - this.alphaDecay * (time.deltaMs / 1000),
      0
    );

    this.velocity = Math.max(
      this.velocity - this.velocityDecay * (time.deltaMs / 1000),
      0
    );

    this.scale.x = Math.max(
      this.scale.x - this.scaleDecay * (time.deltaMs / 1000),
      0
    );

    this.scale.y = Math.max(
      this.scale.y - this.scaleDecay * (time.deltaMs / 1000),
      0
    );
  }
}
