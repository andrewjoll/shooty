import { Color, Container, Sprite, Assets, Texture } from "pixi.js";
import { clamp } from "../utils";
import Mouse from "./Mouse";

export default class Soldier extends Container {
  worldScale = 0.5;

  headContainer: Container;
  helmetContainer: Container;
  helmet: Sprite;
  face: Sprite;

  bodyContainer: Container;
  body: Sprite;
  gun: Sprite;
  shadow: Sprite;

  idleAnimationOffset: number;
  idleAnimationSpeed: number;

  constructor() {
    super();

    this.idleAnimationOffset = Math.random() * 100;
    this.idleAnimationSpeed = 0.5 + Math.random() * 0.5;
    // this.worldScale = 0.9 + Math.random() * 0.1;

    this.headContainer = new Container();
    this.headContainer.zIndex = 3;
    this.headContainer.position.set(0, -95);

    const uniformTint = 200 + Math.round(Math.random() * 55);

    this.helmetContainer = new Container();

    this.helmet = new Sprite(Assets.get<Texture>("soldier-helmet"));
    this.helmet.anchor.set(0.5, 0.8);
    this.helmet.position.set(0, -35);
    this.helmet.tint = new Color(
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

    this.helmetContainer.addChild(this.helmet);
    this.helmetContainer.addChild(helmetMask);
    this.helmetContainer.addChild(helmetCamo);
    this.helmetContainer.mask = helmetMask;

    this.face = new Sprite(Assets.get<Texture>("soldier-head"));
    this.face.anchor.set(0.5, 1);
    this.face.position.set(0, 0);

    const skinTint = 100 + Math.round(Math.random() * 155);
    this.face.tint = new Color(`rgb(${skinTint}, ${skinTint}, ${skinTint})`);

    this.headContainer.addChild(this.face);
    this.headContainer.addChild(this.helmetContainer);

    this.bodyContainer = new Container();
    this.bodyContainer.zIndex = 2;

    this.body = new Sprite(Assets.get<Texture>("soldier-body"));
    this.body.anchor.set(0.5, 1);
    this.body.tint = new Color(
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

    this.bodyContainer.addChild(this.body);
    this.bodyContainer.addChild(bodyMask);
    this.bodyContainer.addChild(bodyCamo);
    this.bodyContainer.mask = bodyMask;

    this.shadow = new Sprite(Assets.get<Texture>("soldier-shadow"));
    this.shadow.anchor.set(0.5, 0.5);
    this.shadow.zIndex = 0;

    this.gun = new Sprite(Assets.get<Texture>("soldier-gun"));
    this.gun.anchor.set(0.4, 0.4);
    this.gun.position.set(0, -60);
    this.gun.zIndex = 5;

    // Add to stage
    this.addChild(this.shadow);
    this.addChild(this.bodyContainer);
    this.addChild(this.gun);
    this.addChild(this.headContainer);

    this.scale.set(this.worldScale);
  }

  update(elapsedTime: number, mouse: Mouse) {
    const gunMovementRange = 40 * this.worldScale;

    const gunBobX = Math.cos(this.idleAnimationOffset + elapsedTime * 0.002);
    const gunBobY =
      Math.sin(this.idleAnimationOffset + elapsedTime * 0.002) *
      3 *
      this.idleAnimationSpeed;

    const dx = mouse.x - this.position.x;
    const dy = mouse.y - this.position.y + 70 * this.worldScale;
    const angle = Math.atan2(dy, dx);

    this.gun.rotation = angle;

    const isFlipped = angle < -(Math.PI / 2) || angle > Math.PI / 2;
    const isBehind = angle > -Math.PI + Math.PI / 4 && angle < -Math.PI / 4;

    let moveX = clamp(dx * 0.1, -gunMovementRange, gunMovementRange);
    let moveY = clamp(dy * 0.1, -gunMovementRange, gunMovementRange);

    const distance = Math.sqrt(moveX * moveX + moveY * moveY);
    const distanceProgress = distance / gunMovementRange;

    this.gun.position.set(
      0 + moveX + gunBobX,
      -60 + moveY + gunBobY - 20 * distanceProgress
    );
    this.gun.scale.set(1, isFlipped ? -1 : 1);

    this.gun.zIndex = isBehind ? 1 : 5;

    // Top right = -Math.PI/8
    // Bottom right = Math.PI/8

    let headMoveX = clamp(dx * 0.1, -10, 10);
    let headMoveY = clamp(dy * 0.1, -5, 5);

    const isMouseRight = dx > 0;
    const range = Math.abs(dx) / (window.innerWidth / 2);
    const headAngle = range * (isMouseRight ? -0.2 : 0.2); // clamp(-range, -0.2, 0);

    const headSway =
      Math.cos(this.idleAnimationOffset + elapsedTime * 0.0005) *
      0.1 *
      this.idleAnimationSpeed;

    this.headContainer.rotation = headAngle + headSway;
    // this.helmet.rotation = headAngle * 0.5;

    this.headContainer.position.set(0 + headMoveX, -95 + headMoveY);
    this.shadow.position.set(
      this.headContainer.position.x * 0.25,
      headMoveY * 0.25
    );
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
