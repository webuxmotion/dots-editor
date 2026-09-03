export function setupInputInterceptors(app) {
  window.addEventListener("resize", () => {
    const dimensions = app.resizeCanvas();
    app.width = dimensions.width;
    app.height = dimensions.height;
  });

  app.input.onDown = (screenMouse) => {
    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
    const activeLayer = app.layers.getActiveLayer();
    if (activeLayer && activeLayer.visible) {
      app.drawer.brushColor = activeLayer.color;
      app.drawer.startStroke(activeLayer, virtualMouse);
    }
  };

  app.input.onMove = (screenMouse) => {
    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);

    if (screenMouse.isDown) {
      const activeLayer = app.layers.getActiveLayer();
      if (activeLayer && activeLayer.visible) {
        app.drawer.brushColor = activeLayer.color;
        app.drawer.continueStroke(virtualMouse);
      }
    }
  };

  app.input.onUp = () => {
    app.drawer.resetStroke();
  };

  app.input.onWheelGesture = (e) => {
    app.viewport.addPan(e.deltaX, e.deltaY);
  };
}
