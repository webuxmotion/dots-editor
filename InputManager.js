// InputManager.js
export default class InputManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.mouse = { x: 0, y: 0, isDown: false };

    this.onDown = null;
    this.onMove = null;
    this.onUp = null;
    this.onPan = null;
    this.onZoom = null; // NEW: Hook for trackpad pinch-to-zoom / Ctrl+Scroll gestures

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

    // Inside InputManager.js -> bindEvents() method:

    // Capture trackpad gestures and mouse wheel movements uniform actions
    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault(); // Secure layout locks to prevent browser viewport shifts

        // UPDATED: Triggers zoom if EITHER Control OR Command/Meta key is pressed
        const isZoomModifier = e.ctrlKey || e.metaKey;

        if (isZoomModifier && this.onZoom) {
          this.onZoom({
            deltaY: e.deltaY,
            mouseX: this.mouse.x,
            mouseY: this.mouse.y,
          });
        } else if (!isZoomModifier && this.onPan) {
          this.onPan({
            deltaX: e.deltaX,
            deltaY: e.deltaY,
          });
        }
      },
      { passive: false },
    );
  }

  updateCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }
}
