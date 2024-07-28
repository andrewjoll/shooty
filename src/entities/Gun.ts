import { Assets, Container, Point, Sprite, Texture } from "pixi.js";
import Entity from "./Entity";
import GameTime from "../GameTime";
import { clamp, lerpAngle } from "../utils";

export default class Gun extends Container {
  flash: Sprite;
  body: Sprite;
  owner: Entity;

  direction: Point = Point.shared;
  targetRotation: number = 0;

  constructor(owner: Entity) {
    super();

    this.owner = owner;

    this.body = new Sprite(Assets.get<Texture>("soldier-gun"));
    this.body.anchor.set(0.4, 0.4);
    this.body.zIndex = 5;

    this.flash = new Sprite(Assets.get<Texture>("soldier-muzzleFlash"));
    this.flash.anchor.set(0, 0.5);
    this.flash.position.set(120, -9);
    this.flash.alpha = 0;
    this.flash.blendMode = "add";

    this.addChild(this.body, this.flash);
  }

  aimAt(target: Point) {
    this.direction = new Point(
      target.x - this.owner.position.x,
      target.y -
        this.owner.position.y -
        (this.position.y + this.height * this.body.anchor.y)
    ).normalize();

    this.targetRotation = Math.atan2(this.direction.y, this.direction.x);
  }

  idle() {
    this.direction = Point.shared;
    this.targetRotation = 0;
  }

  update(time: GameTime) {
    // Rotate
    this.rotation = lerpAngle(this.rotation, this.targetRotation, 0.5);

    if (this.owner.isAttacking) {
      this.flash.alpha = Math.random() < 0.5 ? 0.8 : 0;
      this.flash.scale.set(0.5 + Math.random() * 1.5);
    } else {
      this.flash.alpha = 0;
    }

    const gunMovementRange = 40;

    const recoilAmount = this.owner.attackVector.multiplyScalar(
      this.owner.isAttacking ? Math.random() * -20 : 0
    );

    const gunBobX = Math.cos(time.totalMs * 0.002) + recoilAmount.x;
    const gunBobY =
      Math.sin(time.totalMs * 0.002) * 3 * this.owner.idleAnimationSpeed +
      recoilAmount.y;

    const isFlipped =
      this.targetRotation < -(Math.PI / 2) || this.targetRotation > Math.PI / 2;
    const isBehind =
      this.targetRotation > -Math.PI + Math.PI / 4 &&
      this.targetRotation < -Math.PI / 4;

    const moveX = clamp(
      this.owner.attackVector.x,
      -gunMovementRange,
      gunMovementRange
    );
    const moveY = clamp(
      this.owner.attackVector.y * 2,
      -gunMovementRange,
      gunMovementRange
    );

    const distance = Math.sqrt(moveX * moveX + moveY * moveY);
    const distanceProgress = distance / gunMovementRange;

    this.body.position.set(
      moveX + gunBobX,
      -moveY + gunBobY - 20 * distanceProgress
    );
    this.body.scale.set(1, isFlipped ? -1 : 1);

    this.zIndex = isBehind ? 1 : 5;
  }
}
