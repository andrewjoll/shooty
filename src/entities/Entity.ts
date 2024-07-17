import { Bodies, Body } from "matter-js";
import { Container } from "pixi.js";
import GameTime from "../GameTime";
import Mouse from "./Mouse";

export enum EntityState {
  Idle = "idle",
  Attack = "attack",
  Dead = "dead",
  Moving = "moving",
}

export default class Entity extends Container {
  rigidBody: Body;
  state: EntityState;

  health: number = 100;
  maxHealth: number = 100;

  get isAttacking() {
    return this.state === EntityState.Attack;
  }

  constructor(x: number, y: number) {
    super();

    this.state = EntityState.Idle;

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
