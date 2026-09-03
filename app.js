import { initCanvasResize } from "./canvasResizer.js";
import { setupInputInterceptors } from "./interactionManager.js";
import { bootstrapSystems } from "./AppRegistry.js";
import { RenderEngine } from "./RenderEngine.js";
import { initZoomModule } from "./modules/zoom/index.js";

class DrawingApp {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.renderer = new RenderEngine(this.canvas, this.ctx);
    
    const { systems, ui } = bootstrapSystems(this);
    this.systems = systems;
    this.ui = ui;

    this.viewport = systems.viewport;
    this.layers = systems.layers;
    this.drawer = systems.drawer;
    this.input = systems.input;
    this.cropper = systems.cropper;

    this.resizeCanvas();
    setupInputInterceptors(this);

    initZoomModule(this);

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
