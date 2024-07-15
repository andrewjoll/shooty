import { Color, Container, Sprite, Assets, Texture, Point } from "pixi.js";
import PhysicsEntity from "./PhysicsEntity";
import GameTime from "../GameTime";

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

export default class Enemy extends PhysicsEntity {
  worldScale = 0.5;

  head: Head;
  body: Body;

  shadow: Sprite;

  idleAnimationOffset: number;
  idleAnimationSpeed: number;

  walkSpeed = 0.2;

  moveTarget?: Point;

  constructor(x: number, y: number) {
    super(x, y);

    this.idleAnimationOffset = Math.random() * 100;
    this.idleAnimationSpeed = 0.5 + Math.random() * 0.5;

    this.head = new Head();
    this.body = new Body();

    this.shadow = new Sprite(Assets.get<Texture>("soldier-shadow"));
    this.shadow.anchor.set(0.5, 0.5);
    this.shadow.zIndex = 0;

    // Add to stage
    this.addChild(this.shadow);
    this.addChild(this.body);
    this.addChild(this.head);

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

  update(time: GameTime) {
    this.updatePosition(time);
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
