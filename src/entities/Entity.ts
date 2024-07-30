import { Bodies, Body } from "matter-js";
import { Container, Graphics, Point } from "pixi.js";
import GameTime from "../GameTime";
import Mouse from "./Mouse";
import Soldier from "./Soldier";
import { getNearestEntity } from "../utils";
import Gun from "./Gun";
import HealthBar from "./HealthBar";

export enum EntityState {
  Idle = "idle",
  Attack = "attack",
  Dead = "dead",
  Moving = "moving",
}

export default class Entity extends Container {
  worldScale = 0.5;
  rigidBody: Body;
  state: EntityState;

  idleAnimationSpeed: number;
  walkSpeed: number = 0.2;

  health: number = 100;
  maxHealth: number = 100;
  healthBar?: HealthBar;
  hitOffset: Point;

  sightRange: number = 500;
  attackRangeMax: number = 400;
  attackRangeMin: number = 200;

  attackVector: Point;
  attackPoint: Point;

  weaponVector: Point;
  weaponAngle: number;

  targetEntity?: Entity;
  moveTarget?: Point;
  moveTargetTolerance: number = 10;

  debug: Graphics;

  gun?: Gun;

  get isAttacking() {
    return this.state === EntityState.Attack;
  }

  get hitPosition() {
    return this.position.add(this.hitOffset);
  }

  constructor(x: number, y: number) {
    super();

    this.idleAnimationSpeed = 0.5 + Math.random() * 0.5;

    this.debug = new Graphics();
    this.debug.zIndex = 10;
    this.addChild(this.debug);

    this.state = EntityState.Idle;

    this.attackVector = Point.shared;
    this.attackPoint = Point.shared;
    this.weaponVector = Point.shared;
    this.weaponAngle = 0;
    this.hitOffset = new Point(0, -30);

    this.healthBar = new HealthBar(this.health, this.maxHealth);
    this.healthBar.position.set(0, -220);
    this.addChild(this.healthBar);

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

  findTarget(entities: Array<Entity>) {
    if (this.targetEntity) {
      return;
    }

    const soldiers = entities.filter((entity) => entity instanceof Soldier);

    // Nothing to target
    if (!soldiers.length) {
      this.targetEntity = undefined;
      return;
    }

    this.targetEntity = getNearestEntity(
      this.position,
      soldiers,
      this.sightRange
    );
  }

  update(time: GameTime, mouse: Mouse, entities: Array<Entity>) {
    this.findTarget(entities);

    this.updateDebug(mouse);
  }

  moveTo(target: Point) {
    this.moveTarget = target;
  }

  moveAwayFromTarget(time: GameTime) {
    if (this.moveTarget) {
      const direction = this.moveTarget.subtract(this.position);
      const directionNormalized = direction.normalize().multiplyScalar(-1);

      this.setPosition(
        this.rigidBody.position.x +
          directionNormalized.x * time.deltaMs * this.walkSpeed,
        this.rigidBody.position.y +
          directionNormalized.y * time.deltaMs * this.walkSpeed
      );
    }
  }

  moveIntoRange(time: GameTime) {
    if (this.moveTarget) {
      const targetDirection = this.moveTarget.subtract(this.position);
      const directionNormalized = targetDirection.normalize();
      const distance = targetDirection.magnitude();

      const attackRangeAverage =
        this.attackRangeMin + (this.attackRangeMax - this.attackRangeMin) * 0.5;

      const idealPosition = this.moveTarget.subtract(
        directionNormalized.multiplyScalar(attackRangeAverage)
      );

      const idealDirectionNormalized = idealPosition
        .subtract(this.position)
        .normalize();

      this.setPosition(
        this.rigidBody.position.x +
          idealDirectionNormalized.x * time.deltaMs * this.walkSpeed,
        this.rigidBody.position.y +
          idealDirectionNormalized.y * time.deltaMs * this.walkSpeed
      );

      if (distance <= this.moveTargetTolerance) {
        this.moveTarget = undefined;
      }
    }
  }

  moveTowardsTarget(time: GameTime) {
    if (this.moveTarget) {
      const targetDirection = this.moveTarget.subtract(this.position);
      const directionNormalized = targetDirection.normalize();
      const distance = targetDirection.magnitude();

      this.setPosition(
        this.rigidBody.position.x +
          directionNormalized.x * time.deltaMs * this.walkSpeed,
        this.rigidBody.position.y +
          directionNormalized.y * time.deltaMs * this.walkSpeed
      );

      if (distance <= this.moveTargetTolerance) {
        this.moveTarget = undefined;
      }
    }
  }

  updateDebug(mouse: Mouse) {
    this.debug.clear();

    // Rigid body
    this.debug.circle(
      0,
      -20 / this.worldScale,
      (this.rigidBody.circleRadius ?? 0) / this.worldScale
    );
    this.debug.fill("rgba(0, 255, 0, 0.1)");
    this.debug.stroke("rgba(0, 255, 0, 0.5)");

    // Sight range
    this.debug.circle(0, 0, this.sightRange / this.worldScale);
    this.debug.stroke("rgba(255, 255, 255, 0.5)");

    // Attack range
    const attackRange = this.attackRangeMax - this.attackRangeMin;
    this.debug.circle(
      0,
      0,
      (this.attackRangeMin + attackRange * 0.5) / this.worldScale
    );
    this.debug.stroke({
      color: "rgba(255, 0, 0, 0.1)",
      width: attackRange / this.worldScale,
    });

    // Target entity
    if (this.targetEntity) {
      const targetPosition = this.targetEntity.position.subtract(this.position);
      const targetDirection = targetPosition.normalize();

      const targetDistance = targetPosition.magnitude();

      this.debug.moveTo(0, 0);
      this.debug.lineTo(
        targetPosition.x / this.worldScale,
        targetPosition.y / this.worldScale
      );

      if (targetDistance <= this.attackRangeMax) {
        this.debug.stroke({ color: "rgba(255, 255, 255, 0.3)", width: 10 });
      } else if (targetDistance <= this.sightRange) {
        this.debug.stroke({ color: "rgba(255, 255, 255, 0.1)", width: 10 });
      }

      // Ideal position
      if (this.moveTarget) {
        const attackRangeAverage =
          this.attackRangeMin +
          (this.attackRangeMax - this.attackRangeMin) * 0.5;

        const idealPosition = targetPosition.subtract(
          targetDirection.multiplyScalar(attackRangeAverage)
        );

        this.debug.circle(
          idealPosition.x / this.worldScale,
          idealPosition.y / this.worldScale,
          10
        );
        this.debug.fill({ color: "rgba(0, 255, 0, 1)" });

        this.debug.lineTo(
          idealPosition.x / this.worldScale,
          idealPosition.y / this.worldScale
        );
        this.debug.stroke({ color: "rgba(0, 255, 0, 0.2)", width: 10 });
      }
    }
  }

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

    const actualRange = Math.min(rangeVector.magnitude(), this.attackRangeMax);

    return rangeVector.normalize().multiplyScalar(actualRange);
  }

  distanceTo(entity: Entity): number {
    return entity.position.subtract(this.position).magnitude();
  }
}
