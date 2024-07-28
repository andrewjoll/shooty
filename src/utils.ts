import { Point } from "pixi.js";
import Entity from "./entities/Entity";

export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export const getNearestEntity = (
  origin: Point,
  entities: Array<Entity>,
  range: number
): Entity | undefined => {
  if (!entities.length) {
    return undefined;
  }

  let nearestEntity: Entity | undefined = undefined;
  let nearestDistance = Number.MAX_VALUE;

  for (let i = 0; i < entities.length; i++) {
    const distance = entities[i].position.subtract(origin).magnitude();

    if (distance > range) {
      continue;
    }

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestEntity = entities[i];
    }
  }

  return nearestEntity;
};

const TAU = Math.PI * 2;

export function lerpAngle(
  angleFrom: number,
  angleTo: number,
  weight: number,
  maxAngle: number = TAU
): number {
  const da = (angleTo - angleFrom) % maxAngle;
  const dist = ((2 * da) % maxAngle) - da;

  return angleFrom + dist * weight;
}
