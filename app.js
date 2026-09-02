// app.js
import ColorPicker from "./ColorPicker.js";
import CropManager from "./crop-manager/index.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";
import LayerManager from "./LayerManager.js";
import ZoomStatus from "./crop-manager/ZoomStatus.js";
import Viewport from "./Viewport.js";
import LayersUI from "./LayersUI.js";
import ToolbarUI from "./ToolbarUI.js"; // Import your new toolbar manager

class DrawingApp {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Initialise Dom Graphics Views
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    // 2. Instantiate Decoupled Processing Systems
    this.viewport = new Viewport();
    this.layers = new LayerManager(this.width, this.height);
    this.drawer = new DrawEngine();
    this.input = new InputManager(this.canvas);
    this.cropper = new CropManager(this.canvas, this.layers);
    this.zoomStatus = new ZoomStatus();

    // 3. Connect User Interface Layer Wrappers
    new LayersUI(this.layers);
    new ToolbarUI(this.drawer); // FIXED: Replaced initModeUI with our clean UI class instance
    new ColorPicker("#color");

    this.initCanvasResize();
    this.setupInputInterceptors();

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

    this.ctx.scale(dpr, dpr);
    this.layers.resizeAllLayers(this.width, this.height);
  }

  setupInputInterceptors() {
    window.addEventListener("resize", () => this.initCanvasResize());

    this.input.onDown = (screenMouse) => {
      if (this.viewport.isZoomed) {
        const hitZoomUI = this.zoomStatus.checkHit(screenMouse.x, screenMouse.y, this.width, () => {
          this.viewport.resetToCenter(this.width, this.height);
        });
        if (hitZoomUI) return;
      }

      const virtualMouse = this.viewport.toVirtual(screenMouse.x, screenMouse.y);
      const hitUINode = this.cropper.checkHit(virtualMouse.x, virtualMouse.y);

      if (!hitUINode) {
        const activeLayer = this.layers.getActiveLayer();
        if (activeLayer && activeLayer.visible) {
          this.drawer.brushColor = activeLayer.color;
          this.drawer.startStroke(activeLayer, virtualMouse);
        }
      }
    };

    this.input.onMove = (screenMouse) => {
      const virtualMouse = this.viewport.toVirtual(screenMouse.x, screenMouse.y);

      if (this.cropper.isDragging || this.cropper.isResizing) {
        this.cropper.handleMove(virtualMouse.x, virtualMouse.y);
        return;
      }

      if (screenMouse.isDown) {
        const activeLayer = this.layers.getActiveLayer();
        if (activeLayer && activeLayer.visible) {
          this.drawer.brushColor = activeLayer.color;
          this.drawer.continueStroke(virtualMouse);
        }
      }
    };

    this.input.onUp = () => {
      this.cropper.stopDragging();
      this.drawer.resetStroke();
    };

    this.input.onPan = (deltas) => {
      this.viewport.addPan(deltas.deltaX, deltas.deltaY);
    };

    this.input.onZoom = (zoomData) => {
      this.viewport.executeZoom(zoomData);
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.viewport.applyTransform(this.ctx);

    this.layers.compositeLayers(this.ctx);
    this.cropper.draw(this.ctx);

    this.ctx.restore();

    if (this.viewport.isZoomed) {
      this.zoomStatus.draw(this.ctx, this.width, this.viewport.zoom);
    }
  }

  loop(time) {
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }
}

new DrawingApp();
