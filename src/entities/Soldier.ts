import {
  Color,
  Container,
  Sprite,
  Assets,
  Texture,
  Point,
  Graphics,
} from "pixi.js";
import { clamp } from "../utils";
import Entity, { EntityState } from "./Entity";
import GameTime from "../GameTime";
import Mouse from "./Mouse";
import InputManager from "../InputManager";
import Gun from "./Gun";

class Head extends Container {
  helmetContainer: Container;

  constructor() {
    super();

    const uniformTint = 200 + Math.round(Math.random() * 55);

    this.zIndex = 3;
    this.position.set(0, -95);

    this.helmetContainer = new Container();

    const helmet = new Sprite(Assets.get<Texture>("soldier-helmet"));
    helmet.anchor.set(0.5, 0.8);
    helmet.position.set(0, -35);
    helmet.tint = new Color(
      `rgb(${uniformTint}, ${uniformTint}, ${uniformTint})`
    );

    const helmetMask = new Sprite(Assets.get<Texture>("soldier-helmetMask"));
    helmetMask.anchor.set(0.5, 0.8);
    helmetMask.position.set(0, -35);

    const helmetCamo = new Sprite(Assets.get<Texture>("soldier-camo"));
    helmetCamo.anchor.set(0.5, 0.5);
    helmetCamo.position.set(
      -130 + Math.random() * 260,
      -130 + Math.random() * 260
    );
    helmetCamo.rotation = Math.random() * Math.PI;
    helmetCamo.blendMode = "multiply";
    helmetCamo.alpha = 0.3;

    this.helmetContainer.addChild(helmet);
    this.helmetContainer.addChild(helmetMask);
    this.helmetContainer.addChild(helmetCamo);
    this.helmetContainer.mask = helmetMask;

    const face = new Sprite(Assets.get<Texture>("soldier-head"));
    face.anchor.set(0.5, 1);
    face.position.set(0, 0);

    const skinTint = 100 + Math.round(Math.random() * 155);
    face.tint = new Color(`rgb(${skinTint}, ${skinTint}, ${skinTint})`);

    this.addChild(face);
    this.addChild(this.helmetContainer);
  }
}

class Body extends Container {
  constructor() {
    super();

    const uniformTint = 200 + Math.round(Math.random() * 55);

    this.zIndex = 2;

    const body = new Sprite(Assets.get<Texture>("soldier-body"));
    body.anchor.set(0.5, 1);
    body.tint = new Color(
      `rgb(${uniformTint}, ${uniformTint}, ${uniformTint})`
    );

    const bodyMask = new Sprite(Assets.get<Texture>("soldier-bodyMask"));
    bodyMask.anchor.set(0.5, 1);

    const bodyCamo = new Sprite(Assets.get<Texture>("soldier-camo"));
    bodyCamo.anchor.set(0.5, 0.5);
    bodyCamo.position.set(
      -130 + Math.random() * 260,
      -130 + Math.random() * 260
    );
    bodyCamo.rotation = Math.random() * Math.PI;
    bodyCamo.blendMode = "multiply";
    bodyCamo.alpha = 0.3;

    this.addChild(body);
    this.addChild(bodyMask);
    this.addChild(bodyCamo);
    this.mask = bodyMask;
  }
}

export default class Soldier extends Entity {
  head: Head;
  body: Body;
  shadow: Sprite;

  walkSpeed = 0.2;

  constructor(x: number, y: number) {
    super(x, y);

    this.state = EntityState.Idle;

    this.head = new Head();
    this.body = new Body();
    this.gun = new Gun(this);
    this.gun.position.set(0, -60);

    this.shadow = new Sprite(Assets.get<Texture>("soldier-shadow"));
    this.shadow.anchor.set(0.5, 0.5);
    this.shadow.zIndex = 0;

    // Add to stage
    this.addChild(this.shadow);
    this.addChild(this.body);
    this.addChild(this.gun);
    this.addChild(this.head);

    this.debug = new Graphics();
    this.debug.zIndex = 10;
    this.addChild(this.debug);

    this.scale.set(this.worldScale);

    this.position.set(x, y);

    InputManager.on("attack-start", () => {
      this.state = EntityState.Attack;
    });

    InputManager.on("attack-end", () => {
      this.state = EntityState.Idle;
    });
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

    // Location
    this.debug.circle(0, 0, 10);
    this.debug.fill("rgb(255, 255, 255)");

    // Range clamped query trace
    const rangePoint = this.getRangeClampedTarget(mouse.worldPosition);
    const doubleRangePoint = rangePoint.multiplyScalar(2);
    const actualRange = rangePoint.magnitude();

    this.debug.lineTo(doubleRangePoint.x, doubleRangePoint.y);
    this.debug.stroke({ color: "rgba(0, 255, 0, 0.2)", width: 40 });

    this.debug.circle(doubleRangePoint.x, doubleRangePoint.y, 10);
    this.debug.fill("rgb(0, 255, 0)");

    // Attack range
    this.debug.circle(0, 0, actualRange * 2);
    this.debug.stroke({ color: "rgba(255, 255, 255, 0.3)", width: 3 });

    // Weapon angle
    this.debug.moveTo(0, -150 * this.scale.y);
    this.debug.lineTo(doubleRangePoint.x, doubleRangePoint.y);
    this.debug.stroke({ color: "rgba(255, 255, 255, 0.5)", width: 1 });
  }

  updatePosition(time: GameTime) {
    this.moveTowardsTarget(time);

    this.position.set(
      this.rigidBody.position.x,
      this.rigidBody.position.y + 20
    );
  }

  updateAnimation(time: GameTime, mouse: Mouse) {
    this.attackVector = new Point(
      mouse.worldPosition.x - this.position.x,
      mouse.worldPosition.y - this.position.y
    ).normalize();

    // Gun
    if (this.gun) {
      this.gun.update(time);
      this.gun.aimAt(mouse.worldPosition);
    }

    // Head
    const headMoveX = clamp(this.attackVector.x * 3, -10, 10);
    const headMoveY = clamp(this.attackVector.y * 2, -5, 5);

    const isMouseRight = this.attackVector.x > 0;
    const range = Math.abs(this.attackVector.x) / (window.innerWidth / 2);
    const headAngle = range * (isMouseRight ? -0.2 : 0.2);

    const headSway =
      Math.cos(time.totalMs * 0.0005) * 0.1 * this.idleAnimationSpeed;

    this.head.rotation = headAngle + headSway;
    this.head.position.set(0 + headMoveX, -95 + headMoveY);

    // Shadow
    this.shadow.position.set(this.head.position.x * 0.5, headMoveY * 0.25);
  }

  update(time: GameTime, mouse: Mouse) {
    this.updatePosition(time);
    this.updateAnimation(time, mouse);
    this.updateDebug(mouse);
  }

  static assetBundle() {
    return [
      { alias: "gun", src: "./assets/Gun.png" },
      { alias: "muzzleFlash", src: "./assets/MuzzleFlash.png" },
      { alias: "helmet", src: "./assets/Helmet.png" },
      { alias: "helmetMask", src: "./assets/HelmetMask.png" },
      { alias: "head", src: "./assets/Head.png" },
      { alias: "body", src: "./assets/Body.png" },
      { alias: "bodyMask", src: "./assets/BodyMask.png" },
      { alias: "shadow", src: "./assets/Shadow.png" },
      { alias: "camo", src: "./assets/Camo.jpg" },
    ];
  }
}
