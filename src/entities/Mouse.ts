export default class Mouse {
  x = 0;
  y = 0;

  constructor() {
    window.addEventListener("mousemove", (event) => {
      this.x = event.clientX;
      this.y = event.clientY;
    });
  }
}
