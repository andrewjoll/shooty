import "./style.css";
import { Application, Assets, Container, Point } from "pixi.js";
import "pixi.js/math-extras";
import Soldier from "./entities/Soldier";
import Mouse from "./entities/Mouse";
import { Bodies, Composite, Engine, Render } from "matter-js";
import GameTime from "./GameTime";
import Enemy from "./entities/Enemy";
import { initDebugGraphics } from "./DebugGraphics";
import Barrel from "./entities/Barrel";
import EntityManager from "./EntityManager";

const mouse = new Mouse();

// Create a PixiJS application.
const app = new Application();
// globalThis.__PIXI_APP__ = app;

// Intialize the application.
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

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    background: "transparent",
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    // showStats: true,
    // showDebug: true,
    showCollisions: true,
    showAngleIndicator: true,
    pixelRatio: window.devicePixelRatio,
    showBounds: true,
  },
});

const entityManager = new EntityManager(engine);

render.canvas.classList.add("matter");

const wallWidth = 40;

const leftWall = Bodies.rectangle(
  20,
  window.innerHeight / 2,
  wallWidth,
  window.innerHeight,
  {
    collisionFilter: {
      group: -1,
    },
    isStatic: true,
    render: {
      fillStyle: "rgba(255, 255, 255, 0.1)",
      strokeStyle: "rgba(255, 255, 255, 0.2)",
      lineWidth: 2,
    },
  }
);

const rightWall = Bodies.rectangle(
  window.innerWidth - 20,
  window.innerHeight / 2,
  wallWidth,
  window.innerHeight,
  {
    collisionFilter: {
      group: -1,
    },
    isStatic: true,
    render: {
      fillStyle: "rgba(255, 255, 255, 0.1)",
      strokeStyle: "rgba(255, 255, 255, 0.2)",
      lineWidth: 2,
    },
  }
);

const topWall = Bodies.rectangle(
  window.innerWidth / 2,
  20,
  window.innerWidth,
  wallWidth,
  {
    collisionFilter: {
      group: -1,
    },
    isStatic: true,
    render: {
      fillStyle: "rgba(255, 255, 255, 0.1)",
      strokeStyle: "rgba(255, 255, 255, 0.2)",
      lineWidth: 2,
    },
  }
);

const bottomWall = Bodies.rectangle(
  window.innerWidth / 2,
  window.innerHeight - 20,
  window.innerWidth,
  wallWidth,
  {
    collisionFilter: {
      group: -1,
    },
    isStatic: true,
    render: {
      fillStyle: "rgba(255, 255, 255, 0.1)",
      strokeStyle: "rgba(255, 255, 255, 0.2)",
      lineWidth: 2,
    },
  }
);

Render.run(render);

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
const layerDebug = new Container();

initDebugGraphics(layerDebug);

const soldier = new Soldier(window.innerWidth / 2, window.innerHeight / 2);
const barrel = new Barrel(700, 200);

layerGround.addChild(mouse);

entityManager.addEntity(soldier);
entityManager.addEntity(barrel);

app.stage.addChild(layerGround, entityManager.container, layerDebug);

for (let i = 0; i < 5; i++) {
  const enemy = new Enemy(300 + i * 100, 300 + i * 100);

  entityManager.addEntity(enemy);
}

const gameTime = new GameTime();

gameTime.onTick((time) => {
  Engine.update(engine, time.deltaMs);

  entityManager.update(time, mouse);

  barrel.update();
});

window.addEventListener("click", (event) => {
  soldier.moveTo(new Point(event.clientX, event.clientY));
});
