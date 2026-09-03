export function setupInputInterceptors(app) {
  window.addEventListener("resize", () => {
    const dimensions = app.resizeCanvas();
    app.width = dimensions.width;
    app.height = dimensions.height;
  });

  app.input.onDown = (screenMouse) => {
    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
    const hitUINode = app.cropper.checkHit(virtualMouse.x, virtualMouse.y);

    if (!hitUINode) {
      const activeLayer = app.layers.getActiveLayer();
      if (activeLayer && activeLayer.visible) {
        app.drawer.brushColor = activeLayer.color;
        app.drawer.startStroke(activeLayer, virtualMouse);
      }
    }
  };

  app.input.onMove = (screenMouse) => {
    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);

    if (app.cropper.isDragging || app.cropper.isResizing) {
      app.cropper.handleMove(virtualMouse.x, virtualMouse.y);
      return;
    }

    if (screenMouse.isDown) {
      const activeLayer = app.layers.getActiveLayer();
      if (activeLayer && activeLayer.visible) {
        app.drawer.brushColor = activeLayer.color;
        app.drawer.continueStroke(virtualMouse);
      }
    }
  };

  app.input.onUp = () => {
    app.cropper.stopDragging();
    app.drawer.resetStroke();
  };

  app.input.onWheelGesture = (e) => {
    app.viewport.addPan(e.deltaX, e.deltaY);
  };
}
