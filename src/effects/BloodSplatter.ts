import { Container, Point } from "pixi.js";
import Emitter from "./Emitter";
import Particle, { ParticleState } from "./Particle";
import { randomRange } from "../utils";

class BloodParticle extends Particle {
  constructor() {
    super();

    this.velocity = 0.1;
    this.velocityDecay = 0.5;
    // this.alphaDecay = 2;
    this.scaleDecay = 1;

    this.moveTo(0, 0);
    this.ellipse(0, 0, 10, 5);
    this.fill({ color: "rgb(164, 0, 0)" });
  }
}

export class BloodSplatter extends Emitter {
  origin: Point;
  direction: Point;

  constructor(world: Container, origin: Point, direction: Point) {
    super(world);

    this.numParticles = 3;
    this.looping = true;

    this.origin = origin;
    this.direction = direction;
    this.position.set(origin.x, origin.y);

    this.setup();
  }

  setup() {
    for (let i = 0; i < this.numParticles; i++) {
      const particle = new BloodParticle();

      this.particles.push(particle);
    }

    this.world.addChild(...this.particles);
  }

  reset(particle: Particle): void {
    const spreadX = randomRange(-30, 30);
    const spreadY = randomRange(-30, 30);

    particle.scale.set(randomRange(0.5, 1), randomRange(0.5, 1));
    particle.velocity = randomRange(0.3, 0.5);
    particle.target = this.direction
      .multiplyScalar(100)
      .add(new Point(spreadX, spreadY));

    particle.position.set(0, 0);

    particle.state = ParticleState.Active;
    particle.alpha = 1;
  }
}
