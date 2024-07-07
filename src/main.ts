import "./style.css";
import { Application, Assets } from "pixi.js";
import Soldier from "./entities/Soldier";
import Mouse from "./entities/Mouse";

const mouse = new Mouse();

// Create a PixiJS application.
const app = new Application();

// Intialize the application.
await app.init({
  background: "#5E6F42",
  resizeTo: window,
  resolution: window.devicePixelRatio,
});

Assets.addBundle("soldier", Soldier.assetBundle());

await Assets.loadBundle("soldier");

// Then adding the application's canvas to the DOM body.
document.body.appendChild(app.canvas);

const soldiers: Array<Soldier> = [];

const soldier = new Soldier();
soldier.position.set(window.innerWidth / 2, window.innerHeight / 2);

app.stage.addChild(soldier);

soldiers.push(soldier);

let elapsedTime = 0;

app.ticker.add((time) => {
  elapsedTime += time.elapsedMS;

  soldiers.forEach((soldier) => {
    soldier.update(elapsedTime, mouse);
  });
});
