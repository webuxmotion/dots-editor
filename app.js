import { initCanvasResize } from "./canvasResizer.js";
import { setupInputInterceptors } from "./interactionManager.js";
import { bootstrapSystems } from "./AppRegistry.js";
import { RenderEngine } from "./RenderEngine.js";

class DrawingApp {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Initialise Dom Graphics Contexts
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    // 2. Component Initialization & Rendering Infrastructure
    this.renderer = new RenderEngine(this.canvas, this.ctx);
    
    // Boot up all systems dynamically via registry pipeline
    const { systems, ui } = bootstrapSystems(this);
    this.systems = systems;
    this.ui = ui;

    // Direct object references mirror legacy mapping setups for interactionManager backward safety
    this.viewport = systems.viewport;
    this.layers = systems.layers;
    this.drawer = systems.drawer;
    this.input = systems.input;
    this.cropper = systems.cropper;
    this.zoomStatus = systems.zoomStatus;

    // 3. Kick off window listeners and active graphics loop cycles
    this.resizeCanvas();
    setupInputInterceptors(this);

    this.renderer.startLoop(() => this.update());
  }

  resizeCanvas() {
    return initCanvasResize(this.canvas, this.ctx, this.systems.layers);
  }

  update() {
    this.renderer.render(this, this.systems);
  }
}

new DrawingApp();
