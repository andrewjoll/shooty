import { Bodies, Body } from "matter-js";
import { Container } from "pixi.js";
import GameTime from "../GameTime";
import Mouse from "./Mouse";

interface IEntity {
  update(time: GameTime, mouse: Mouse): void;
}

export default class PhysicsEntity extends Container implements IEntity {
  rigidBody: Body;

  constructor(x: number, y: number) {
    super();

    this.rigidBody = Bodies.circle(x, y, 20, {
      frictionAir: 0.05,
      density: 0.1,
      render: {
        fillStyle: "rgba(255, 0, 0, 0.2)",
        strokeStyle: "rgba(255, 0, 0, 0.4)",
        lineWidth: 2,
      },
    });
  }

  setPosition(x: number, y: number) {
    Body.setPosition(this.rigidBody, { x, y });
  }

  update(time: GameTime, mouse: Mouse) {}
}
