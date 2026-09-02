// LayersUI.js
export default class LayersUI {
  constructor(layerManager) {
    this.layers = layerManager;
    this.listContainer = document.getElementById("layers-list");
    this.addBtn = document.getElementById("add-layer-btn");

    this.init();
  }

  init() {
    if (this.addBtn) {
      this.addBtn.addEventListener("click", () => this.layers.addLayer());
    }

    this.layers.onLayerChange = (layerArray, activeIndex) => {
      if (!this.listContainer) return;
      const currentItems = this.listContainer.querySelectorAll(".layer-item");

      // Patch DOM parameters smoothly if length checks match
      if (currentItems.length === layerArray.length) {
        layerArray.forEach((layer, idx) => {
          const li = currentItems[idx];
          if (idx === activeIndex) li.classList.add("is-active");
          else li.classList.remove("is-active");

          const toggleBtn = li.querySelector(".layer-toggle");
          if (toggleBtn) {
            toggleBtn.innerHTML = layer.visible ? "👁️" : "👁️‍🗨️";
            if (!layer.visible) toggleBtn.classList.add("is-hidden");
            else toggleBtn.classList.remove("is-hidden");
          }

          const colorInput = li.querySelector(".layer-color-input");
          if (colorInput && document.activeElement !== colorInput) {
            colorInput.value = layer.color;
            colorInput.parentElement.style.backgroundColor = layer.color;
          }
        });
        return;
      }

      // Rebuild configuration states if items count varies
      this.listContainer.innerHTML = "";

      layerArray.forEach((layer, idx) => {
        const li = document.createElement("li");
        li.className = `layer-item ${idx === activeIndex ? "is-active" : ""}`;
        li.title = layer.name;

        li.addEventListener("click", () => this.layers.setActiveLayer(idx));

        // 1. Color Picker Circle Container
        const colorWrapper = document.createElement("div");
        colorWrapper.className = "color-picker-wrapper";
        colorWrapper.style.backgroundColor = layer.color;

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "layer-color-input";
        colorInput.value = layer.color;

        colorInput.addEventListener("input", (e) => {
          colorWrapper.style.backgroundColor = e.target.value;
          this.layers.setLayerColor(idx, e.target.value);
        });
        colorInput.addEventListener("mousedown", (e) => e.stopPropagation());
        colorInput.addEventListener("click", (e) => e.stopPropagation());

        colorWrapper.appendChild(colorInput);

        // 2. Layer Index Number Badge
        const badge = document.createElement("div");
        badge.className = "layer-badge";
        badge.textContent = `L${layerArray.length - idx}`;

        // 3. Floating Side Action Bar Container
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "layer-actions";

        // Visibility Toggle
        const toggleBtn = document.createElement("button");
        toggleBtn.className = `layer-toggle ${!layer.visible ? "is-hidden" : ""}`;
        toggleBtn.innerHTML = layer.visible ? "👁️" : "👁️‍🗨️";
        toggleBtn.title = "Toggle Visibility";
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.layers.toggleVisibility(idx);
        });

        // Delete Trash Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "layer-delete";
        deleteBtn.innerHTML = "✕";
        deleteBtn.title = "Delete Layer";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.layers.removeLayer(idx);
        });

        actionsDiv.appendChild(toggleBtn);
        if (layerArray.length > 1) actionsDiv.appendChild(deleteBtn);

        li.appendChild(colorWrapper);
        li.appendChild(badge);
        li.appendChild(actionsDiv);

        this.listContainer.appendChild(li);
      });
    };

    this.layers.triggerUIUpdate();
  }
}
