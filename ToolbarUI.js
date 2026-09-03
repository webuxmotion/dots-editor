export default class ToolbarUI {
  constructor(drawEngine) {
    this.drawer = drawEngine;
    this.container = document.getElementById("mode-container");
    this.init();
  }

  init() {
    if (!this.container) return;

    this.buttons = this.container.querySelectorAll("button");
    this.buttons.forEach((btn) => {
      if (btn.id === this.drawer.currentMode) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });

    this.container.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      this.buttons.forEach((btn) => btn.classList.remove("is-active"));
      const selectedId = e.target.id;
      this.drawer.setMode(selectedId);
      e.target.classList.add("is-active");
    });
  }
}
