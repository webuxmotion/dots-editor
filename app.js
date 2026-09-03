import { initCanvasResize } from "./canvasResizer.js";
import { setupInputInterceptors } from "./interactionManager.js";
import { bootstrapSystems } from "./AppRegistry.js";
import { RenderEngine } from "./RenderEngine.js";

import { initLayersModule } from "./modules/layers/index.js";
import { initZoomModule } from "./modules/zoom/index.js";
import { initCropModule } from "./modules/crop/index.js";

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
    this.captureGraphics = (targetCtx) => {
      targetCtx.drawImage(this.canvas, 0, 0);
    };

    this.viewport = systems.viewport;
    this.drawer = systems.drawer;
    this.input = systems.input;

    this.resizeCanvas();
    setupInputInterceptors(this);

    initLayersModule(this);
    initZoomModule(this);
    initCropModule(this);

    this.renderer.startLoop(() => this.update());
  }

  resizeCanvas() {
    return initCanvasResize(this.canvas, this.ctx);
  }

  update() {
    this.renderer.render(this, this.systems);
  }
}

new DrawingApp();
