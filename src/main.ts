import "./style.css";
import { Application, Assets, Container, Point } from "pixi.js";
import Soldier from "./entities/Soldier";
import Mouse from "./entities/Mouse";
import { Bodies, Composite, Engine, Render } from "matter-js";
import GameTime from "./GameTime";
import Enemy from "./entities/Enemy";
import { initDebugGraphics } from "./DebugGraphics";

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

render.canvas.classList.add("matter");

const wallWidth = 40;

const leftWall = Bodies.rectangle(
  20,
  window.innerHeight / 2,
  wallWidth,
  window.innerHeight,
  {
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

await Assets.loadBundle("mouse");
await Assets.loadBundle("soldier");

// Then adding the application's canvas to the DOM body.

document.body.appendChild(app.canvas);

const layerGround = new Container();
const layerEntities = new Container();
const layerDebug = new Container();

initDebugGraphics(layerDebug);

const enemies: Array<Enemy> = [];

const soldier = new Soldier(window.innerWidth / 2, window.innerHeight / 2);

layerGround.addChild(mouse);
layerEntities.addChild(soldier);
layerEntities.sortableChildren = true;

app.stage.addChild(layerGround, layerEntities, layerDebug);

Composite.add(engine.world, [soldier.rigidBody]);

for (let i = 0; i < 5; i++) {
  const enemy = new Enemy(300 + i * 100, 300 + i * 100);

  layerEntities.addChild(enemy);

  enemies.push(enemy);

  Composite.add(engine.world, enemy.rigidBody);
}

const gameTime = new GameTime();

gameTime.onTick((time) => {
  Engine.update(engine, time.deltaMs);

  soldier.update(time, layerEntities);

  enemies.forEach((enemy) => enemy.update(time));

  layerEntities.children.forEach((child) => {
    child.zIndex = child.position.y;
  });
});

window.addEventListener("click", (event) => {
  soldier.moveTo(new Point(event.clientX, event.clientY));
});
