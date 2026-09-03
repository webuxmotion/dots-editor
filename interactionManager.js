export function setupInputInterceptors(app) {
  // 1. Window Resize Interceptor
  window.addEventListener("resize", () => {
    const dimensions = app.resizeCanvas();
    app.width = dimensions.width;
    app.height = dimensions.height;
  });

  // 2. Pointer/Mouse Down
  app.input.onDown = (screenMouse) => {
    if (app.viewport.isZoomed) {
      const hitZoomUI = app.zoomStatus.checkHit(screenMouse.x, screenMouse.y, app.width, () => {
        app.viewport.resetToCenter(app.width, app.height);
      });
      if (hitZoomUI) return;
    }

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

  // 3. Pointer/Mouse Move
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

  // 4. Pointer Up
  app.input.onUp = () => {
    app.cropper.stopDragging();
    app.drawer.resetStroke();
  };

  // 5. Navigation (Pan & Zoom)
  app.input.onPan = (deltas) => {
    app.viewport.addPan(deltas.deltaX, deltas.deltaY);
  };

  app.input.onZoom = (zoomData) => {
    app.viewport.executeZoom(zoomData);
  };
}
