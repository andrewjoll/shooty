import { Container, Point } from "pixi.js";
import Emitter from "./Emitter";
import Particle, { ParticleState } from "./Particle";
import GameTime from "../GameTime";
import { randomRange } from "../utils";

class BulletParticle extends Particle {
  constructor() {
    super();

    this.velocity = 0.8;

    this.moveTo(0, 0);
    this.lineTo(20, 0);
    this.stroke({ color: "rgba(255, 206, 80)", width: 1 });
    this.blendMode = "add";
  }
}

export class BulletTracer extends Emitter {
  origin: Point;
  target: Point;

  constructor(world: Container) {
    super(world);

    this.origin = Point.shared;
    this.target = Point.shared;
    this.looping = true;
    this.delay = 100;

    this.setup();
  }

  setOrigin(origin: Point) {
    this.origin = origin;
  }

  setTarget(target: Point) {
    this.target = target;
  }

  setup() {
    for (let i = 0; i < this.numParticles; i++) {
      const particle = new BulletParticle();

      this.particles.push(particle);
    }

    this.world.addChild(...this.particles);
  }

  update(time: GameTime): void {
    this.position.set(this.origin.x, this.origin.y);

    super.update(time);
  }

  reset(particle: Particle): void {
    const targetDistance = this.origin.subtract(this.target).magnitude();

    const spread = targetDistance * 0.02;

    const spreadX = randomRange(-spread, spread);
    const spreadY = randomRange(-spread, spread);

    particle.target = new Point(
      this.target.x + spreadX,
      this.target.y + spreadY
    );
    particle.position.set(this.origin.x, this.origin.y);

    particle.state = ParticleState.Active;
    particle.alpha = 1;
  }
}
