import { Container, Point } from "pixi.js";
import Entity from "./entities/Entity";
import { Composite, Engine, Query } from "matter-js";
import GameTime from "./GameTime";
import Mouse from "./entities/Mouse";
import Soldier from "./entities/Soldier";

export default class EntityManager {
  container: Container;
  physics: Engine;

  entities: Array<Entity>;

  constructor(physics: Engine) {
    this.physics = physics;
    this.container = new Container({ sortableChildren: true });
    this.entities = [];
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);

    Composite.add(this.physics.world, entity.rigidBody);

    this.container.addChild(entity);
  }

  update(time: GameTime, mouse: Mouse) {
    // Sort by y-position
    this.container.children.forEach((child) => {
      child.zIndex = child.position.y;
    });

    this.entities.forEach((entity) => entity.update(time, mouse));

    const soldier = this.entities.find((entity) => entity instanceof Soldier);

    if (soldier) {
      this.queryRay(soldier.x, soldier.y, mouse.x, mouse.y);
    }
  }

  queryRay(x1: number, y1: number, x2: number, y2: number) {
    const endPoint = new Point(x2, y2);
    // const endPointProjected = endPoint.normalize();

    const result = Query.ray(
      this.physics.world.bodies,
      { x: x1, y: y1 },
      { x: endPoint.x, y: endPoint.y }
    );

    if (!result.length) {
      return;
    }

    // result.forEach((collision) => {
    //   collision.bodyA.render.fillStyle = "rgba(0, 255, 0, 0.2)";
    //   collision.bodyB.render.fillStyle = "rgba(0, 255, 0, 0.2)";
    // });
  }
}
