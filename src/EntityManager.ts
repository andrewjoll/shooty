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

    this.entities.forEach((entity) =>
      entity.update(time, mouse, this.entities)
    );

    const soldier = this.entities.find((entity) => entity instanceof Soldier);

    if (soldier && soldier.isAttacking) {
      const target = soldier.getRangeClampedTarget(mouse.worldPosition);

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
    const startPoint = new Point(x1, y1);
    const endPoint = new Point(x2, y2);

    const result = Query.ray(
      this.physics.world.bodies,
      { x: x1, y: y1 },
      { x: endPoint.x, y: endPoint.y },
      40
    );

    if (!result.length) {
      return;
    }

    const distanceSorted = result.sort((a, b) => {
      const aDistance = new Point(a.bodyA.position.x, a.bodyA.position.y)
        .subtract(startPoint)
        .magnitude();

      const bDistance = new Point(b.bodyA.position.x, b.bodyA.position.y)
        .subtract(startPoint)
        .magnitude();

      if (aDistance < bDistance) {
        return -1;
      } else if (bDistance > aDistance) {
        return 1;
      }

      return 0;
    });

    for (let i = 0; i < distanceSorted.length; i++) {
      const collision = distanceSorted[i];

      // ignore attacker
      if (collision.bodyA.plugin?.entity === attacker) {
        continue;
      }

      if (collision.bodyA.plugin?.entity) {
        (collision.bodyA.plugin.entity as Entity).weaponHit(
          attacker,
          new Point(x2 - x1, y2 - y1).normalize()
        );

        // stop after first contact
        return;
      }
    }
  }
}
