import BezierState from "./BezierState.js";
import BezierUI from "./BezierUI.js";

export function initBezierModule(app) {
  const state = new BezierState();
  const ui = new BezierUI();

  const container = document.getElementById("mode-container");
  if (container) {
    const btn = document.createElement("button");
    btn.id = "BEZIER";
    btn.className = "toolbar-btn";
    btn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 19c6-13 12-13 18 0" />
        <circle cx="3" cy="19" r="2" />
        <circle cx="21" cy="19" r="2" />
      </svg>
      <span>Bezier Spline</span>
    `;
    container.appendChild(btn);
    app.drawer.modes["BEZIER"] = "BEZIER";

    btn.addEventListener("click", () => {
      app.drawer.setMode("BEZIER");
    });
  }

  const originalRender = app.renderer.render;
  app.renderer.render = function (appInstance, systems) {
    originalRender.call(this, appInstance, systems);
    
    const ctx = this.ctx;
    ctx.save();
    appInstance.viewport.applyTransform(ctx);
    
    const activeLayer = appInstance.layers ? appInstance.layers.getActiveLayer() : null;
    const brushColor = activeLayer ? activeLayer.color : "#000000";
    
    ui.draw(ctx, state, brushColor, false);
    ctx.restore();
  };

  const originalCapture = app.captureGraphics;
  app.captureGraphics = function (targetCtx, scale) {
    if (originalCapture) originalCapture.call(this, targetCtx, scale);
    
    const activeLayer = app.layers ? app.layers.getActiveLayer() : null;
    const brushColor = activeLayer ? activeLayer.color : "#000000";
    
    ui.draw(targetCtx, state, brushColor, true);
  };

  const originalOnDown = app.input.onDown;
  app.input.onDown = (screenMouse) => {
    if (app.cropper && app.cropper.isVisible) {
      const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
      const cropperHit = app.cropper.checkHit(virtualMouse.x, virtualMouse.y);
      if (cropperHit) {
        if (originalOnDown) originalOnDown(screenMouse);
        return;
      }
    }

    if (app.drawer.currentMode !== "BEZIER") {
      if (originalOnDown) originalOnDown(screenMouse);
      return;
    }

    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
    const hit = state.checkHit(virtualMouse.x, virtualMouse.y);

    if (!hit) {
      state.addAnchor(virtualMouse.x, virtualMouse.y);
    }
  };

  const originalOnMove = app.input.onMove;
  app.input.onMove = (screenMouse) => {
    if (app.cropper && app.cropper.isVisible && (app.cropper.isDragging || app.cropper.isResizing)) {
      if (originalOnMove) originalOnMove(screenMouse);
      return;
    }

    if (app.drawer.currentMode !== "BEZIER") {
      if (originalOnMove) originalOnMove(screenMouse);
      return;
    }

    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
    if (state.selectedElement) {
      state.handleMove(virtualMouse.x, virtualMouse.y);
    }
  };

  const originalOnUp = app.input.onUp;
  app.input.onUp = () => {
    if (app.cropper && app.cropper.isVisible) {
      if (originalOnUp) originalOnUp();
    }

    if (app.drawer.currentMode !== "BEZIER") {
      return;
    }
    state.stopDragging();
  };
}
