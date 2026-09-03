import CropManager from "./CropManager.js";
import ExportService from "../../services/ExportService.js";

export function initCropModule(app) {
  const cropper = new CropManager(app.canvas, app.canvas);
  app.cropper = cropper;

  const defaultWidth = 500;
  const defaultHeight = 500;
  cropper.cropRect.width = defaultWidth;
  cropper.cropRect.height = defaultHeight;
  cropper.cropRect.x = (window.innerWidth / 2) - (defaultWidth / 2);
  cropper.cropRect.y = (window.innerHeight / 2) - (defaultHeight / 2);

  const toggleBtn = document.getElementById("toggle-crop");
  if (toggleBtn) {
    const btnText = toggleBtn.querySelector("span");
    toggleBtn.addEventListener("click", () => {
      cropper.isVisible = !cropper.isVisible;
      if (btnText) {
        btnText.textContent = cropper.isVisible ? "Hide Crop Area" : "Show Crop Area";
      }
      if (!cropper.isVisible) {
        cropper.showConfirmation = false;
      }
    });
  }

  const saveBtn = document.getElementById("crop-and-save");
  if (saveBtn) {
    const btnText = toggleBtn ? toggleBtn.querySelector("span") : null;
    saveBtn.addEventListener("click", () => {
      if (cropper.isVisible) {
        ExportService.saveRegion(
          (tempCtx, scale) => app.captureGraphics(tempCtx, scale),
          cropper.cropRect
        );
      } else {
        cropper.isVisible = true;
        if (btnText) btnText.textContent = "Hide Crop Area";
        cropper.showConfirmation = true;
      }
    });
  }

  const originalRender = app.renderer.render;
  app.renderer.render = function (appInstance, systems) {
    originalRender.call(this, appInstance, systems);
    const ctx = this.ctx;
    ctx.save();
    appInstance.viewport.applyTransform(ctx);
    cropper.draw(ctx);
    ctx.restore();
  };

  const originalOnDown = app.input.onDown;
  app.input.onDown = (screenMouse) => {
    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);
    const hitResult = cropper.checkHit(virtualMouse.x, virtualMouse.y);
    
    if (hitResult === "MINIMIZE") {
      cropper.isVisible = false;
      cropper.showConfirmation = false;
      if (toggleBtn) {
        const btnText = toggleBtn.querySelector("span");
        if (btnText) btnText.textContent = "Show Crop Area";
      }
      return;
    }

    if (hitResult === "OK") {
      cropper.showConfirmation = false;
      ExportService.saveRegion(
        (tempCtx, scale) => app.captureGraphics(tempCtx, scale),
        cropper.cropRect
      );
      return;
    }
    
    if (hitResult === "CANCEL") {
      cropper.showConfirmation = false;
      return;
    }

    if (hitResult === true) return;
    if (originalOnDown) originalOnDown(screenMouse);
  };

  const originalOnMove = app.input.onMove;
  app.input.onMove = (screenMouse) => {
    const virtualMouse = app.viewport.toVirtual(screenMouse.x, screenMouse.y);

    if (cropper.isVisible && (cropper.isDragging || cropper.isResizing)) {
      cropper.handleMove(virtualMouse.x, virtualMouse.y);
      return;
    }
    if (originalOnMove) originalOnMove(screenMouse);
  };

  const originalOnUp = app.input.onUp;
  app.input.onUp = () => {
    cropper.stopDragging();
    if (originalOnUp) originalOnUp();
  };
}
