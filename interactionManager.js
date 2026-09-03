export function setupInputInterceptors(app) {
  window.addEventListener("resize", () => {
    const dimensions = app.resizeCanvas();
    app.width = dimensions.width;
    app.height = dimensions.height;
  });

  app.input.onDown = (screenMouse) => {};

  app.input.onMove = (screenMouse) => {};

  app.input.onUp = () => {
    app.drawer.resetStroke();
  };

  app.input.onWheelGesture = (e) => {
    app.viewport.addPan(e.deltaX, e.deltaY);
  };
}
