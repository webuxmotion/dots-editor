// app.js
import ColorPicker from "./ColorPicker.js";
import CropManager from "./crop-manager/index.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";
import LayerManager from "./LayerManager.js";

class DrawingApp {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.prevTime = 0;

    // Viewport camera states (Figma navigation space)
    this.pan = { x: 0, y: 0 };
    this.zoom = 1.0; // NEW: Tracks current scale layout level
    this.minZoom = 0.1; // Max out-zoom limits (10%)
    this.maxZoom = 10.0; // Max in-zoom limits (1000%)

    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.layers = new LayerManager(this.width, this.height);
    this.drawer = new DrawEngine();
    this.input = new InputManager(this.canvas);
    this.cropper = new CropManager(this.canvas, this.layers);
    new ColorPicker("#color");

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
    this.layers.resizeAllLayers(this.width, this.height);
  }

  // UPDATED: Adjust coordinate spaces to handle zooming variations
  getVirtualMouse(screenMouse) {
    return {
      x: (screenMouse.x - this.pan.x) / this.zoom,
      y: (screenMouse.y - this.pan.y) / this.zoom,
    };
  }

  setupInputInterceptors() {
    window.addEventListener("resize", () => this.initCanvasResize());

    this.input.onDown = (screenMouse) => {
      const virtualMouse = this.getVirtualMouse(screenMouse);

      const hitUINode = this.cropper.checkHit(virtualMouse.x, virtualMouse.y);
      if (!hitUINode) {
        const activeLayer = this.layers.getActiveLayer();
        if (activeLayer && activeLayer.visible) {
          this.drawer.brushColor = activeLayer.color;
          this.drawer.startStroke(activeLayer, virtualMouse);
        }
      }
    };

    this.input.onMove = (screenMouse) => {
      // Convert standard viewport values into active virtual zoom coordinates
      const virtualMouse = this.getVirtualMouse(screenMouse);

      // If manipulating crop handles, run transformation calculations
      if (this.cropper.isDragging || this.cropper.isResizing) {
        this.cropper.handleMove(virtualMouse.x, virtualMouse.y);
        return;
      }

      // Handle painting path extensions relative to current magnification depths
      if (screenMouse.isDown) {
        const activeLayer = this.layers.getActiveLayer();
        if (activeLayer && activeLayer.visible) {
          this.drawer.brushColor = activeLayer.color;
          this.drawer.continueStroke(virtualMouse);
        }
      }
    };

    this.input.onUp = () => {
      this.cropper.stopDragging();
      this.drawer.resetStroke();
    };

    this.input.onPan = (deltas) => {
      this.pan.x -= deltas.deltaX;
      this.pan.y -= deltas.deltaY;
    };

    // NEW: Handles zoom transformations centered precisely on the user's cursor
    this.input.onZoom = (zoomData) => {
      const zoomFactor = 1.02; // Scaling speed step configuration variable
      const oldZoom = this.zoom;

      // Adjust zoom level based on wheel rotation direction
      if (zoomData.deltaY < 0) {
        this.zoom = Math.min(this.maxZoom, this.zoom * zoomFactor);
      } else {
        this.zoom = Math.max(this.minZoom, this.zoom / zoomFactor);
      }

      // FIGMA ZOOM ANCHOR MATH MATH FUNCTIONS:
      // Adjust panning coordinates so the pixel under the mouse cursor stays stationary
      this.pan.x =
        zoomData.mouseX -
        (zoomData.mouseX - this.pan.x) * (this.zoom / oldZoom);
      this.pan.y =
        zoomData.mouseY -
        (zoomData.mouseY - this.pan.y) * (this.zoom / oldZoom);
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();

    // UPDATED: Composite layout transforms uniformly for camera updates
    this.ctx.translate(this.pan.x, this.pan.y);
    this.ctx.scale(this.zoom, this.zoom); // Dynamic matrix scaling applied directly here

    this.layers.compositeLayers(this.ctx);
    this.cropper.draw(this.ctx);

    this.ctx.restore();
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
      const currentItems = listContainer.querySelectorAll(".layer-item");

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
      listContainer.innerHTML = "";

      layerArray.forEach((layer, idx) => {
        const li = document.createElement("li");
        li.className = `layer-item ${idx === activeIndex ? "is-active" : ""}`;
        li.title = layer.name; // Keep name string readable inside browser tooltips

        // Select layer row on click
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
        // Display logical position (e.g. total count minus index position values)
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

        // Append everything together into row fragment references
        li.appendChild(colorWrapper);
        li.appendChild(badge);
        li.appendChild(actionsDiv);

        listContainer.appendChild(li);
      });
    };

    this.layers.triggerUIUpdate();
  }
}

new DrawingApp();
