import { Container } from "pixi.js";
import { BulletTracer } from "./BulletTracer";

class EffectFactory {
  world: Container;

  constructor() {
    this.world = new Container();
  }

  init(world: Container) {
    this.world = world;
  }

  createBulletTracer(): BulletTracer {
    return new BulletTracer(this.world);
  }
}

const instance = new EffectFactory();

export default instance;
