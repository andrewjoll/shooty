import { Bodies, Body } from "matter-js";
import { Container, Point } from "pixi.js";
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

  attackVector: Point;
  attackPoint: Point;
  weaponVector: Point;
  weaponAngle: number;
  attackRange: number;

  get isAttacking() {
    return this.state === EntityState.Attack;
  }

  constructor(x: number, y: number) {
    super();

    this.state = EntityState.Idle;

    this.attackVector = Point.shared;
    this.attackPoint = Point.shared;
    this.weaponVector = Point.shared;
    this.weaponAngle = 0;
    this.attackRange = 400;

    this.rigidBody = Bodies.circle(x, y, 20, {
      frictionAir: 0.05,
      density: 0.1,
      inertia: Infinity,
      plugin: {
        entity: this,
      },
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

  weaponHit(attacker: Entity, direction: Point) {
    Body.applyForce(
      this.rigidBody,
      { x: 0, y: 0 },
      { x: direction.x * 0.1, y: direction.y * 0.1 }
    );
  }

  getRangeClampedTarget(target: Point): Point {
    const rangeVector = new Point(
      target.x - this.position.x,
      target.y - this.position.y
    );

    const actualRange = Math.min(rangeVector.magnitude(), this.attackRange);

    return rangeVector.normalize().multiplyScalar(actualRange);
  }
}
