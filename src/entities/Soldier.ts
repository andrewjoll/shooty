import { Color, Container, Sprite, Assets, Texture, Point } from "pixi.js";
import { clamp } from "../utils";
import PhysicsEntity from "./PhysicsEntity";
import GameTime from "../GameTime";
import Enemy from "./Enemy";
import HealthBar from "./HealthBar";
import Mouse from "./Mouse";

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

class Gun extends Container {
  constructor() {
    super();

    this.position.set(0, -60);

    const gun = new Sprite(Assets.get<Texture>("soldier-gun"));
    gun.anchor.set(0.4, 0.4);
    gun.zIndex = 5;

    this.addChild(gun);
  }
}

export default class Soldier extends PhysicsEntity {
  worldScale = 0.5;

  healthBar: HealthBar;
  head: Head;
  body: Body;

  gun: Gun;
  shadow: Sprite;

  idleAnimationOffset: number;
  idleAnimationSpeed: number;

  walkSpeed = 0.2;

  moveTarget?: Point;
  activeEnemy?: Enemy;

  constructor(x: number, y: number) {
    super(x, y);

    this.idleAnimationOffset = Math.random() * 100;
    this.idleAnimationSpeed = 0.5 + Math.random() * 0.5;

    this.head = new Head();
    this.body = new Body();
    this.gun = new Gun();

    this.shadow = new Sprite(Assets.get<Texture>("soldier-shadow"));
    this.shadow.anchor.set(0.5, 0.5);
    this.shadow.zIndex = 0;

    this.healthBar = new HealthBar(80, 100);

    // Add to stage
    this.addChild(this.shadow);
    this.addChild(this.body);
    this.addChild(this.gun);
    this.addChild(this.head);
    this.addChild(this.healthBar);

    this.scale.set(this.worldScale);

    this.position.set(x, y);
  }

  moveTo(target: Point) {
    this.moveTarget = target;
  }

  updatePosition(time: GameTime) {
    if (this.moveTarget) {
      const distance = new Point(
        this.moveTarget.x - this.position.x,
        this.moveTarget.y - this.position.y
      );

      const magnitude = Math.sqrt(
        distance.x * distance.x + distance.y * distance.y
      );

      const distanceNormalized = new Point(
        distance.x / magnitude,
        distance.y / magnitude
      );

      this.setPosition(
        this.rigidBody.position.x +
          distanceNormalized.x * time.deltaMs * this.walkSpeed,
        this.rigidBody.position.y +
          distanceNormalized.y * time.deltaMs * this.walkSpeed
      );

      if (magnitude < 10) {
        this.moveTarget = undefined;
      }
    }

    this.position.set(
      this.rigidBody.position.x,
      this.rigidBody.position.y + 20
    );
  }

  updateAnimation(time: GameTime, mouse: Mouse) {
    const dx = mouse.x - this.position.x;
    const dy = mouse.y - this.position.y + 70 * this.worldScale;
    const angleToMouse = Math.atan2(dy, dx);

    // Gun
    const gunMovementRange = 40 * this.worldScale;

    const gunBobX = Math.cos(this.idleAnimationOffset + time.totalMs * 0.002);
    const gunBobY =
      Math.sin(this.idleAnimationOffset + time.totalMs * 0.002) *
      3 *
      this.idleAnimationSpeed;

    this.gun.rotation = angleToMouse;

    const isFlipped =
      angleToMouse < -(Math.PI / 2) || angleToMouse > Math.PI / 2;
    const isBehind =
      angleToMouse > -Math.PI + Math.PI / 4 && angleToMouse < -Math.PI / 4;

    const moveX = clamp(dx * 0.1, -gunMovementRange, gunMovementRange);
    const moveY = clamp(dy * 0.1, -gunMovementRange, gunMovementRange);

    const distance = Math.sqrt(moveX * moveX + moveY * moveY);
    const distanceProgress = distance / gunMovementRange;

    this.gun.position.set(
      0 + moveX + gunBobX,
      -60 + moveY + gunBobY - 20 * distanceProgress
    );
    this.gun.scale.set(1, isFlipped ? -1 : 1);

    this.gun.zIndex = isBehind ? 1 : 5;

    // Head
    const headMoveX = clamp(dx * 0.1, -10, 10);
    const headMoveY = clamp(dy * 0.1, -5, 5);

    const isMouseRight = dx > 0;
    const range = Math.abs(dx) / (window.innerWidth / 2);
    const headAngle = range * (isMouseRight ? -0.2 : 0.2);

    const headSway =
      Math.cos(this.idleAnimationOffset + time.totalMs * 0.0005) *
      0.1 *
      this.idleAnimationSpeed;

    this.head.rotation = headAngle + headSway;
    this.head.position.set(0 + headMoveX, -95 + headMoveY);

    // Shadow
    this.shadow.position.set(this.head.position.x * 0.5, headMoveY * 0.25);
  }

  update(time: GameTime, mouse: Mouse) {
    this.updatePosition(time);

    // this.findEnemy(entities);

    this.updateAnimation(time, mouse);
  }

  static assetBundle() {
    return [
      { alias: "gun", src: "./assets/Gun.png" },
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
