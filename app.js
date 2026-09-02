// app.js
import ColorPicker from "./ColorPicker.js";
import CropManager from "./crop-manager/index.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";

class DrawingApp {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.prevTime = 0;

    // 1. Structural Dom Element References
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    // 2. Separate Offscreen Graphic Buffers
    this.drawingCanvas = document.createElement("canvas");
    this.dCtx = this.drawingCanvas.getContext("2d");

    // 3. Instantiate Specialized Isolated Submodules
    this.drawer = new DrawEngine(this.dCtx);
    this.input = new InputManager(this.canvas);
    this.cropper = new CropManager(this.canvas, this.drawingCanvas);
    new ColorPicker("#color");

    // 4. Initialize Core Engine Systems
    this.initCanvasResize();
    this.setupInputInterceptors();
    this.initModeUI();
    
    // 5. Fire Frame Updates Animation Loop
    requestAnimationFrame((time) => this.loop(time));
  }

  initCanvasResize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.drawingCanvas.width = this.width * dpr;
    this.drawingCanvas.height = this.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.dCtx.scale(dpr, dpr);
  }

  // Hook input manager callback streams cleanly into workflow systems
  setupInputInterceptors() {
    window.addEventListener("resize", () => this.initCanvasResize());

    this.input.onDown = (mouseState) => {
      // Hit testing delegated completely to the crop folder manager
      const hitUINode = this.cropper.checkHit(mouseState.x, mouseState.y);
      if (!hitUINode) {
        this.drawer.executeStroke(mouseState); // Draw immediate dot if click didn't land on UI handles
      }
    };

    this.input.onMove = (mouseState) => {
      if (this.cropper.isDragging || this.cropper.isResizing) {
        this.cropper.handleMove(mouseState.x, mouseState.y);
        return;
      }

      if (mouseState.isDown) {
        this.drawer.executeStroke(mouseState);
      }
    };

    this.input.onUp = () => {
      this.cropper.stopDragging();
      this.drawer.resetStroke(); // Clear line vector coordinate trace variables safely
    };
  }

  initModeUI() {
    const container = document.getElementById("mode-container");
    if (!container) return;

    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      if (btn.id === this.drawer.currentMode) btn.classList.add("is-active");
    });

    container.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;

      buttons.forEach((btn) => btn.classList.remove("is-active"));
      
      const selectedId = e.target.id;
      this.drawer.setMode(selectedId);
      e.target.classList.add("is-active");
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.drawingCanvas, 0, 0, this.width, this.height);
    this.cropper.draw(this.ctx);
  }

  loop(time) {
    const delta = (time - this.prevTime) / 1000;
    this.prevTime = time;

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Spin up app directly
new DrawingApp();
