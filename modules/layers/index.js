import LayerManager from "./LayerManager.js";
import LayersUI from "./LayersUI.js";

export function initLayersModule(app) {
  const layers = new LayerManager(app.width, app.height);
  app.layers = layers;
  new LayersUI(layers);

  const originalResize = app.resizeCanvas;
  app.resizeCanvas = function () {
    const dimensions = originalResize.call(this);
    layers.resizeAllLayers(dimensions.width, dimensions.height);
    return dimensions;
  };

  const originalRender = app.renderer.render;
  app.renderer.render = function (appInstance, systems) {
    const ctx = this.ctx;
    const { viewport } = systems;

    ctx.clearRect(0, 0, appInstance.width, appInstance.height);

    ctx.save();
    viewport.applyTransform(ctx);
    layers.compositeLayers(ctx);
    ctx.restore();

    if (appInstance.cropper) {
      ctx.save();
      viewport.applyTransform(ctx);
      appInstance.cropper.draw(ctx);
      ctx.restore();
    }

    if (appInstance.zoomUI) {
      appInstance.zoomUI.draw(ctx, appInstance.width, appInstance.zoomState);
    }
  };

  const originalOnDown = app.input.onDown;
  app.input.onDown = (screenMouse) => {
    if (app.cropper) {
      const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
      if (app.cropper.checkHit(virtualMouse.x, virtualMouse.y)) return;
    }

    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
    const activeLayer = layers.getActiveLayer();

    if (activeLayer && activeLayer.visible) {
      app.drawer.brushColor = activeLayer.color;

      // The DrawEngine creates the stroke, the layer module pushes it to the layer array!
      const newStroke = app.drawer.startStroke(virtualMouse);
      activeLayer.strokes.push(newStroke);
    }
  };

  app.captureGraphics = (targetCtx, scale) => {
    layers.compositeLayers(targetCtx, scale);
  };

  const originalOnMove = app.input.onMove;
  app.input.onMove = (screenMouse) => {
    if (app.cropper && (app.cropper.isDragging || app.cropper.isResizing)) {
      const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
      app.cropper.handleMove(virtualMouse.x, virtualMouse.y);
      return;
    }

    if (screenMouse.isDown) {
      const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
      const activeLayer = layers.getActiveLayer();
      if (activeLayer && activeLayer.visible) {
        app.drawer.brushColor = activeLayer.color;
        app.drawer.continueStroke(virtualMouse);
      }
    }
  };
}
