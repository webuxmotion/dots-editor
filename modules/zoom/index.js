import ZoomState from "./ZoomState.js";
import ZoomUI from "./ZoomUI.js";

export function initZoomModule(app) {
  const zoomState = new ZoomState();
  const zoomUI = new ZoomUI();

  app.viewport.toVirtual = function (screenX, screenY) {
    return {
      x: (screenX - this.pan.x) / zoomState.value,
      y: (screenY - this.pan.y) / zoomState.value,
    };
  };

  app.viewport.applyTransform = function (ctx) {
    ctx.translate(this.pan.x, this.pan.y);
    ctx.scale(zoomState.value, zoomState.value);
  };

  const originalRender = app.renderer.render;
  app.renderer.render = function (appInstance, systems) {
    originalRender.call(this, appInstance, systems);
    zoomUI.draw(this.ctx, appInstance.width, zoomState);
  };

  const originalOnDown = app.input.onDown;
  app.input.onDown = (screenMouse) => {
    if (zoomState.isActive) {
      const hitReset = zoomUI.checkHit(screenMouse.x, screenMouse.y, app.width);
      if (hitReset) {
        zoomState.reset(app.viewport.pan, app.width, app.height);
        return;
      }
    }
    if (originalOnDown) originalOnDown(screenMouse);
  };

  const originalWheel = app.input.onWheelGesture;
  app.input.onWheelGesture = (e, mouse) => {
    const isZoomGesture = e.ctrlKey || e.metaKey;
    if (isZoomGesture) {
      zoomState.executeZoom(e, mouse, app.viewport.pan);
      return;
    }
    if (originalWheel) originalWheel(e, mouse);
  };
}
