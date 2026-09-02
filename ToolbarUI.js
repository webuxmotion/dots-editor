// ToolbarUI.js
import ExportService from "./crop-manager/ExportService.js";

export default class ToolbarUI {
  // UPDATED: Added layerManager and cropManager to the constructor
  constructor(drawEngine, layerManager, cropManager) {
    this.drawer = drawEngine;
    this.layers = layerManager;
    this.cropper = cropManager;
    
    this.container = document.getElementById("mode-container");
    this.saveBtn = document.getElementById("crop-and-save"); // Query the HTML save button
    
    this.init();
  }

  init() {
    // 1. Highlight the default drawing mode button on load
    if (this.container) {
      this.buttons = this.container.querySelectorAll("button");
      this.buttons.forEach((btn) => {
        if (btn.id === this.drawer.currentMode) {
          btn.classList.add("is-active");
        } else {
          btn.classList.remove("is-active");
        }
      });

      // Handle tool switching clicks
      this.container.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") return;
        this.buttons.forEach((btn) => btn.classList.remove("is-active"));
        const selectedId = e.target.id;
        this.drawer.setMode(selectedId);
        e.target.classList.add("is-active");
      });
    }

    // 2. FIXED: Link the HTML Save button directly to the static ExportService utility
    if (this.saveBtn) {
      this.saveBtn.addEventListener("click", () => {
        ExportService.saveCrop(this.layers, this.cropper.cropRect);
      });
    }
  }
}
