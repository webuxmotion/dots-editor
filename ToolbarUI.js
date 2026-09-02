// ToolbarUI.js
export default class ToolbarUI {
  constructor(drawEngine) {
    this.drawer = drawEngine;
    this.container = document.getElementById("mode-container");
    
    if (this.container) {
      this.buttons = this.container.querySelectorAll("button");
      this.init();
    }
  }

  init() {
    // FIXED: Highlight the default button matching the current mode on page load
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

      // Clear previous states uniformly
      this.buttons.forEach((btn) => btn.classList.remove("is-active"));
      
      const selectedId = e.target.id;
      this.drawer.setMode(selectedId);
      e.target.classList.add("is-active");
    });
  }
}
