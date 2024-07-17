import { Container, Graphics, Point } from "pixi.js";
import GameTime from "../GameTime";
import Mouse from "./Mouse";

enum ParticleState {
  Idle = "idle",
  Dead = "dead",
  Active = "active",
}

class Particle extends Graphics {
  target: Point;
  velocity: number;
  state: ParticleState;

  constructor() {
    super();

    this.state = ParticleState.Idle;
    this.alpha = 0;

    this.target = Point.shared;
    this.velocity = 0.5;

    this.moveTo(0, 0);
    this.lineTo(5, 0);
    this.stroke({ color: "rgba(255, 206, 80)", width: 2 });
  }

  update(time: GameTime) {
    if (this.state !== ParticleState.Active) {
      return;
    }

    const deltaX = this.target.x - this.position.x;
    const deltaY = this.target.y - this.position.y;

    const distance = new Point(deltaX, deltaY).magnitude();

    if (distance < 10) {
      this.state = ParticleState.Dead;
      this.alpha = 0;
      return;
    }

    const angleToTarget = Math.atan2(deltaY, deltaX);
    const deltaNormalized = new Point(deltaX, deltaY).normalize();

    this.rotation = angleToTarget;
    this.position.set(
      this.position.x + deltaNormalized.x * this.velocity * time.deltaMs,
      this.position.y + deltaNormalized.y * this.velocity * time.deltaMs
    );
  }
}

export default class Emitter extends Container {
  particles: Array<Particle>;
  activeParticles: number;

  delay: number;
  lastEmit: number;
  nextEmit: number;

  tracer: Graphics;

  origin: Container;

  constructor(origin: Container) {
    super();

    this.origin = origin;

    this.particles = [];
    this.activeParticles = 0;

    this.delay = 100;
    this.lastEmit = performance.now();
    this.nextEmit = 0;

    this.tracer = new Graphics();
    this.addChild(this.tracer);

    for (let i = 0; i < 1; i++) {
      const particle = new Particle();

      this.particles.push(particle);
    }

    this.addChild(...this.particles);
  }

  reset(particle: Particle, mouse: Mouse) {
    const spread = 0; //-25 + Math.random() * 50;

    particle.target = new Point(
      mouse.x - this.position.x + spread,
      mouse.y - this.position.y + spread
    );

    particle.position.set(0, 0);

    particle.state = ParticleState.Active;
    particle.alpha = 1;
  }

  update(time: GameTime, mouse: Mouse) {
    this.position.set(this.origin.x, this.origin.y - 40);

    this.tracer.clear();
    this.tracer.lineTo(mouse.x - this.position.x, mouse.y - this.position.y);
    this.tracer.stroke({ color: "rgba(255, 255, 255, 0.5)", width: 1 });

    if (
      this.activeParticles < this.particles.length &&
      performance.now() > this.nextEmit
    ) {
      this.reset(this.particles[this.activeParticles], mouse);

      this.nextEmit = performance.now() + this.delay;
      this.activeParticles++;
    }

    this.particles.forEach((particle) => {
      particle.update(time);

      if (particle.state === ParticleState.Dead) {
        this.reset(particle, mouse);
      }
    });
  }
}
