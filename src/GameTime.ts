export default class GameTime {
  startMs = 0;
  deltaMs = 0;
  totalMs = 0;

  lastFrameMs = 0;
  currentFrameMs = 0;

  rafHandler?: number;
  tickHandler?: (time: GameTime) => void;

  constructor() {
    this.startMs = performance.now();

    this.start();
  }

  start() {
    this.rafHandler = requestAnimationFrame(this.update.bind(this));
  }

  pause() {
    if (!this.rafHandler) {
      return;
    }

    cancelAnimationFrame(this.rafHandler);
  }

  update() {
    this.rafHandler = requestAnimationFrame(this.update.bind(this));

    this.lastFrameMs = this.currentFrameMs;
    this.currentFrameMs = performance.now();
    this.deltaMs = this.currentFrameMs - this.lastFrameMs;
    this.totalMs = performance.now() - this.startMs;

    if (this.tickHandler) {
      this.tickHandler(this);
    }
  }

  onTick(callback: (time: GameTime) => void) {
    this.tickHandler = callback;
  }
}
