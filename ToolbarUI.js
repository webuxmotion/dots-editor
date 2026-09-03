export default class ToolbarUI {
  constructor(drawEngine) {
    this.drawer = drawEngine;
    this.container = document.getElementById("mode-container");
    this.sizeSlider = document.getElementById("brush-size-input");
    this.sizeLabel = document.getElementById("brush-size-val");
    this.init();
  }

  init() {
    if (this.container) {
      this.buttons = this.container.querySelectorAll("button");
      this.buttons.forEach((btn) => {
        if (btn.id === this.drawer.currentMode) {
          btn.classList.add("is-active");
        } else {
          btn.classList.remove("is-active");
        }
      });

      this.container.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON" || e.target.id === "bezier-apply") return;
        this.buttons.forEach((btn) => btn.classList.remove("is-active"));
        const selectedId = e.target.id;
        this.drawer.setMode(selectedId);
        e.target.classList.add("is-active");
      });
    }

    if (this.sizeSlider) {
      this.sizeSlider.addEventListener("input", (e) => {
        const val = e.target.value;
        this.drawer.setBrushSize(val);
        if (this.sizeLabel) this.sizeLabel.textContent = `${val}px`;
      });
    }
  }
}
