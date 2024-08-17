import "./style.css";
import { Application, Assets, Container } from "pixi.js";
import "pixi.js/math-extras";
import Soldier from "./entities/Soldier";
import Mouse from "./entities/Mouse";
import { Bodies, Composite, Engine } from "matter-js";
import GameTime from "./GameTime";
import Enemy from "./entities/Enemy";
import { initDebugGraphics } from "./DebugGraphics";
import Barrel from "./entities/Barrel";
import EntityManager from "./EntityManager";
import Viewport from "./Viewport";
import EffectFactory from "./effects/EffectFactory";

// Create a PixiJS application.
const app = new Application();
// globalThis.__PIXI_APP__ = app;

const viewport = new Viewport(app.stage, 3000, 2000);
const mouse = new Mouse(viewport);

// Intialize the application.
const init = async () => {
  await app.init({
    background: "#5E6F42",
    resizeTo: window,
    resolution: window.devicePixelRatio,
  });

  const engine = Engine.create({
    gravity: {
      x: 0,
      y: 0,
    },
  });

  const entityManager = new EntityManager(engine);

  const wallWidth = 40;

  const leftWall = Bodies.rectangle(
    -(wallWidth * 0.5),
    viewport.worldHeight * 0.5,
    wallWidth,
    viewport.worldHeight,
    {
      isStatic: true,
    }
  );

  const rightWall = Bodies.rectangle(
    viewport.worldWidth + wallWidth * 0.5,
    viewport.worldHeight * 0.5,
    wallWidth,
    viewport.worldHeight,
    {
      isStatic: true,
    }
  );

  const topWall = Bodies.rectangle(
    viewport.worldWidth * 0.5,
    -(wallWidth * 0.5),
    viewport.worldWidth,
    wallWidth,
    {
      isStatic: true,
    }
  );

  const bottomWall = Bodies.rectangle(
    viewport.worldWidth * 0.5,
    viewport.worldHeight + wallWidth * 0.5,
    viewport.worldWidth,
    wallWidth,
    {
      isStatic: true,
    }
  );

  // add all of the bodies to the world
  Composite.add(engine.world, [leftWall, rightWall, topWall, bottomWall]);

  Assets.addBundle("soldier", Soldier.assetBundle());
  Assets.addBundle("mouse", Mouse.assetBundle());
  Assets.addBundle("barrel", Barrel.assetBundle());

  await Assets.loadBundle("mouse");
  await Assets.loadBundle("soldier");
  await Assets.loadBundle("barrel");

  document.body.appendChild(app.canvas);

  const layerGround = new Container();
  const layerEffects = new Container();
  const layerDebug = new Container();

  initDebugGraphics(layerDebug);

  EffectFactory.init(layerEffects);

  const soldier = new Soldier(
    viewport.worldWidth * 0.5,
    viewport.worldHeight * 0.5
  );
  const barrel = new Barrel(1200, 700);

  layerGround.addChild(mouse);

  entityManager.addEntity(soldier);
  entityManager.addEntity(barrel);

  // const tracerEmitter = new BulletTracer(app.stage, soldier, barrel);
  // tracerEmitter.position.set(soldier.position.x, soldier.position.y);

  // const bloodEmitter = new BloodSplatter(
  //   app.stage,
  //   new Point(1800, 1000),
  //   new Point(1, 0)
  // );

  app.stage.addChild(
    layerGround,
    entityManager.container,
    layerEffects,
    layerDebug
    // tracerEmitter,
    // bloodEmitter
  );

  for (let i = 0; i < 5; i++) {
    const enemy = new Enemy(
      900 - i * 50,
      viewport.worldHeight * 0.5 - 200 + i * 100
    );

    entityManager.addEntity(enemy);
  }

  const gameTime = new GameTime();

  gameTime.onTick((time) => {
    Engine.update(engine, time.deltaMs);

    entityManager.update(time, mouse);

    // tracerEmitter.update(time, mouse);
    // bloodEmitter.update(time, mouse);

    viewport.update(time, mouse);
    mouse.update();
  });

  window.addEventListener("click", () => {
    soldier.moveTo(mouse.worldPosition);
  });
};

init();
