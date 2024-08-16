import { Container, Graphics } from "pixi.js";
import GameTime from "../GameTime";
import Particle, { ParticleState } from "./Particle";

enum EmitterState {
  Inactive = "inactive",
  Active = "active",
}

class BasicParticle extends Particle {
  constructor() {
    super();

    this.velocity = 1;

    this.moveTo(0, 0);
    this.circle(0, 0, 5);
    this.fill({ color: "rgba(255, 255, 255, 0.5)" });
  }
}

export default class Emitter extends Container {
  state: EmitterState;
  particles: Array<Particle>;
  activeParticles: number;

  delay: number;
  lastEmit: number;
  nextEmit: number;

  debug: Graphics;

  looping: boolean;
  numParticles: number;

  world: Container;

  constructor(world: Container) {
    super();

    this.world = world;

    this.state = EmitterState.Inactive;
    this.looping = false;

    this.numParticles = 10;
    this.particles = [];
    this.activeParticles = 0;

    this.delay = 100;
    this.lastEmit = performance.now();
    this.nextEmit = 0;

    this.debug = new Graphics();
    this.addChild(this.debug);
  }

  start() {
    this.state = EmitterState.Active;
  }

  stop() {
    this.state = EmitterState.Inactive;
  }

  setup() {
    for (let i = 0; i < this.numParticles; i++) {
      const particle = new BasicParticle();

      this.particles.push(particle);
    }

    this.world.addChild(...this.particles);
  }

  reset(particle: Particle) {
    // const spread = -10 + Math.random() * 20;

    // particle.target = new Point(
    //   mouse.worldPosition.x - this.position.x + spread,
    //   mouse.worldPosition.y - this.position.y + spread
    // );

    particle.position.set(0, 0);

    particle.state = ParticleState.Active;
    particle.alpha = 1;
  }

  update(time: GameTime) {
    this.particles.forEach((particle) => {
      if (particle.state === ParticleState.Dead) {
        this.activeParticles--;

        if (this.looping) {
          particle.state = ParticleState.Inactive;
        }
      }

      if (
        particle.state === ParticleState.Inactive &&
        this.state === EmitterState.Active
      ) {
        if (performance.now() > this.nextEmit) {
          this.reset(particle);

          this.nextEmit = performance.now() + this.delay;
          this.activeParticles++;
        }
      }

      particle.update(time);
    });
  }
}
