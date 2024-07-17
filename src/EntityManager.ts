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

    if (soldier && soldier.isAttacking) {
      const target = soldier.getRangeClampedTarget(mouse.position);

      this.queryRay(
        soldier.x,
        soldier.y,
        soldier.x + target.x,
        soldier.y + target.y,
        soldier
      );
    }
  }

  queryRay(x1: number, y1: number, x2: number, y2: number, attacker: Entity) {
    const endPoint = new Point(x2, y2);

    const result = Query.ray(
      this.physics.world.bodies,
      { x: x1, y: y1 },
      { x: endPoint.x, y: endPoint.y }
    );

    if (!result.length) {
      return;
    }

    result.forEach((collision) => {
      // ignore attacker
      if (
        collision.bodyA.plugin?.entity === attacker ||
        collision.bodyB.plugin?.entity === attacker
      ) {
        return;
      }

      if (collision.bodyA.plugin?.entity) {
        (collision.bodyA.plugin.entity as Entity).weaponHit(
          attacker,
          new Point(x2 - x1, y2 - y1).normalize()
        );
      }
    });
  }
}
