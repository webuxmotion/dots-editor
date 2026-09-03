export default class InputManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.mouse = { x: 0, y: 0, isDown: false };

    this.onDown = null;
    this.onMove = null;
    this.onUp = null;
    this.onWheelGesture = null;

    this.bindEvents();
  }

  bindEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.updateCoordinates(e);
      this.mouse.isDown = true;
      if (this.onDown) this.onDown(this.mouse);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      this.updateCoordinates(e);
      if (this.onMove) this.onMove(this.mouse);
    });

    window.addEventListener("mouseup", () => {
      this.mouse.isDown = false;
      if (this.onUp) this.onUp(this.mouse);
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (this.onWheelGesture) {
          this.onWheelGesture(e, this.mouse);
        }
      },
      { passive: false }
    );
  }

  updateCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
}
