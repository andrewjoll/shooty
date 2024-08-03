import { Color, Container, Sprite, Assets, Texture, Point } from "pixi.js";
import GameTime from "../GameTime";
import Entity, { EntityState } from "./Entity";
import Mouse from "./Mouse";
import Gun from "./Gun";
import { clamp } from "../utils";

class Head extends Container {
  helmetContainer: Container;

  constructor() {
    super();

    this.zIndex = 3;
    this.position.set(0, -95);

    this.helmetContainer = new Container();

    const helmet = new Sprite(Assets.get<Texture>("soldier-helmet"));
    helmet.anchor.set(0.5, 0.8);
    helmet.position.set(0, -35);
    helmet.tint = "rgb(255, 150, 150)";

    this.helmetContainer.addChild(helmet);

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

    this.zIndex = 2;

    const body = new Sprite(Assets.get<Texture>("soldier-body"));
    body.tint = "rgb(255, 150, 150)";
    body.anchor.set(0.5, 1);

    this.addChild(body);
  }
}

export default class Enemy extends Entity {
  head: Head;
  body: Body;

  shadow: Sprite;

  idleAnimationOffset: number;
  idleAnimationSpeed: number;

  walkSpeed = 0.1;

  constructor(x: number, y: number) {
    super(x, y);

    this.idleAnimationOffset = Math.random() * 100;
    this.idleAnimationSpeed = 0.5 + Math.random() * 0.5;

    this.head = new Head();
    this.body = new Body();

    this.gun = new Gun(this);
    this.gun.position.set(0, -60);

    this.shadow = new Sprite(Assets.get<Texture>("soldier-shadow"));
    this.shadow.anchor.set(0.5, 0.5);
    this.shadow.zIndex = 0;

    this.addChild(this.shadow);
    this.addChild(this.body);
    this.addChild(this.gun);
    this.addChild(this.head);

    this.scale.set(this.worldScale);

    this.position.set(x, y);
  }

  updatePosition(time: GameTime) {
    // move within firing range of target
    if (this.targetEntity) {
      const distance = this.targetEntity.distanceTo(this);

      this.moveIntoRange(time);

      if (distance <= this.attackRangeMax) {
        this.state = EntityState.Attack;
      }

      if (distance > this.sightRange) {
        this.moveTarget = undefined;
        this.state = EntityState.Idle;
      } else {
        this.moveTarget = this.targetEntity.position;
      }
    }

    this.position.set(
      this.rigidBody.position.x,
      this.rigidBody.position.y + 20
    );
  }

  // @ts-ignore
  updateAnimation(time: GameTime, mouse: Mouse) {
    if (this.targetEntity) {
      this.attackVector = new Point(
        this.targetEntity.x - this.position.x,
        this.targetEntity.y - this.position.y
      ).normalize();
    }

    // Gun
    if (this.gun) {
      this.gun.update(time);

      if (this.targetEntity) {
        this.gun.aimAt(this.targetEntity.hitPosition);
      }
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

  update(time: GameTime, mouse: Mouse, entities: Array<Entity>) {
    super.update(time, mouse, entities);

    this.updatePosition(time);
    this.updateAnimation(time, mouse);
  }

  static assetBundle() {
    return [
      { alias: "helmet", src: "./assets/Helmet.png" },
      { alias: "head", src: "./assets/Head.png" },
      { alias: "body", src: "./assets/Body.png" },
      { alias: "shadow", src: "./assets/Shadow.png" },
    ];
  }
}
