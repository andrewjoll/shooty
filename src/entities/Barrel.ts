import { Bodies, Body } from "matter-js";
import { Assets, Sprite, Texture } from "pixi.js";
import Entity from "./Entity";

export default class Barrel extends Entity {
  rigidBody: Body;

  constructor(x: number, y: number) {
    super(x, y);

    this.position.set(x, y);
    this.scale.set(0.5);

    const barrel = new Sprite(Assets.get<Texture>("barrel-barrel"));
    barrel.anchor.set(0.5, 1);

    this.addChild(barrel);

    this.rigidBody = Bodies.rectangle(x, y, 70, 30, {
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

    this.setPosition(x, y);
  }

  update() {
    this.position.set(
      this.rigidBody.position.x,
      this.rigidBody.position.y + 25
    );
  }

  setPosition(x: number, y: number) {
    Body.setPosition(this.rigidBody, { x, y });
  }

  static assetBundle() {
    return [{ alias: "barrel", src: "./assets/Barrel.png" }];
  }
}
