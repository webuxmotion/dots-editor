// app.js
import ColorPicker from "./ColorPicker.js";
import CropManager from "./crop-manager/index.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";
import LayerManager from "./LayerManager.js"; // Import layers code module

class DrawingApp {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.prevTime = 0;

    // 1. Setup Visible Canvas Viewport Target
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    // 2. Instantiate Decoupled Layer Manager (Replaces single drawingCanvas)
    this.layers = new LayerManager(this.width, this.height);

    // 3. Instantiate Submodules
    this.drawer = new DrawEngine();
    this.input = new InputManager(this.canvas);

    // Pass 'this' or composite function reference down to crop manager so it can read composite data arrays
    this.cropper = new CropManager(this.canvas, this.layers);
    new ColorPicker("#color");

    // 4. Run System Initializers
    this.initCanvasResize();
    this.setupInputInterceptors();
    this.initModeUI();
    this.setupLayerUIDelegates();

    requestAnimationFrame((time) => this.loop(time));
  }

  initCanvasResize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.ctx.scale(dpr, dpr);

    // Resize layers structure memory maps
    this.layers.resizeAllLayers(this.width, this.height);
  }

  setupInputInterceptors() {
    window.addEventListener("resize", () => this.initCanvasResize());

    this.input.onDown = (mouseState) => {
      const hitUINode = this.cropper.checkHit(mouseState.x, mouseState.y);
      if (!hitUINode) {
        const activeLayer = this.layers.getActiveLayer();
        if (activeLayer && activeLayer.visible) {
          // Initialize vector coordinate tracking group
          this.drawer.startStroke(activeLayer, mouseState);
        }
      }
    };

    this.input.onMove = (mouseState) => {
      if (this.cropper.isDragging || this.cropper.isResizing) {
        this.cropper.handleMove(mouseState.x, mouseState.y);
        return;
      }

      if (mouseState.isDown) {
        const activeLayer = this.layers.getActiveLayer();
        if (activeLayer && activeLayer.visible) {
          // Record current move coordinates
          this.drawer.continueStroke(mouseState);
        }
      }
    };

    this.input.onUp = () => {
      this.cropper.stopDragging();
      this.drawer.resetStroke();
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Flatten and render all active stacked visibility layers underneath the UI
    this.layers.compositeLayers(this.ctx, this.width, this.height);

    // Overlay Crop selectors on top
    this.cropper.draw(this.ctx);
  }

  loop(time) {
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  initModeUI() {
    const container = document.getElementById("mode-container");
    if (!container) return;
    const buttons = container.querySelectorAll("button");
    container.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      buttons.forEach((btn) => btn.classList.remove("is-active"));
      this.drawer.setMode(e.target.id);
      e.target.classList.add("is-active");
    });
  }

  // Replace this function inside your DrawingApp class in app.js
  setupLayerUIDelegates() {
    const listContainer = document.getElementById("layers-list");
    const addBtn = document.getElementById("add-layer-btn");

    if (addBtn) {
      addBtn.addEventListener("click", () => this.layers.addLayer());
    }

    this.layers.onLayerChange = (layerArray, activeIndex) => {
      if (!listContainer) return;

      // 1. Get all current list elements already existing in the DOM
      const currentItems = listContainer.querySelectorAll(".layer-item");

      // 2. If the count matches, do NOT overwrite innerHTML! Just patch the state properties.
      if (currentItems.length === layerArray.length) {
        layerArray.forEach((layer, idx) => {
          const li = currentItems[idx];

          // Dynamic class syncing for the active layer highlights
          if (idx === activeIndex) {
            li.classList.add("is-active");
          } else {
            li.classList.remove("is-active");
          }

          // Sync the eye icon status
          const toggleBtn = li.querySelector(".layer-toggle");
          if (toggleBtn) toggleBtn.innerHTML = layer.visible ? "👁️" : "🙈";

          // Sync the color box value ONLY if the user isn't currently using it
          const colorInput = li.querySelector(".layer-color-input");
          if (colorInput && document.activeElement !== colorInput) {
            colorInput.value = layer.color;
          }
        });
        return; // Exit smoothly. The inputs are preserved, keeping the color picker open!
      }

      // 3. Fallback: Only rebuild the entire list when a layer is added or deleted
      listContainer.innerHTML = "";

      layerArray.forEach((layer, idx) => {
        const li = document.createElement("li");
        li.className = `layer-item ${idx === activeIndex ? "is-active" : ""}`;

        // Create Layer Color Picker Element
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "layer-color-input";
        colorInput.value = layer.color;

        // Fires on every single mouse slide drag move across picker map fields
        colorInput.addEventListener("input", (e) => {
          this.layers.setLayerColor(idx, e.target.value);
        });

        // Stop event from bubbling up to change active layers while clicking color swatches
        colorInput.addEventListener("mousedown", (e) => e.stopPropagation());

        // Create Name description element
        const nameSpan = document.createElement("span");
        nameSpan.className = "layer-name";
        nameSpan.textContent = layer.name;
        nameSpan.addEventListener("click", () =>
          this.layers.setActiveLayer(idx),
        );

        // Create Visibility Toggle Button
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "layer-toggle";
        toggleBtn.innerHTML = layer.visible ? "👁️" : "🙈";
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.layers.toggleVisibility(idx);
        });

        // Create Delete Layer Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "layer-delete";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.layers.removeLayer(idx);
        });

        // Append fragments
        li.appendChild(colorInput);
        li.appendChild(nameSpan);
        li.appendChild(toggleBtn);
        if (layerArray.length > 1) li.appendChild(deleteBtn);

        listContainer.appendChild(li);
      });
    };

    this.layers.triggerUIUpdate();
  }
}

new DrawingApp();
