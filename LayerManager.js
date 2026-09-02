// LayerManager.js
export default class LayerManager {
  constructor(width, height) {
    this.baseWidth = width;
    this.baseHeight = height;
    this.layers = [];
    this.activeLayerIndex = 0;
    this.layerCounter = 0;

    // Automatically create a default base layer on startup
    this.addLayer("Background", "#ffffff");
  }

  addLayer(name = null, defaultColor = "#ffffff") {
    this.layerCounter++;
    const newLayer = {
      id: Symbol(`layer_${this.layerCounter}`),
      name: name || `Layer ${this.layerCounter}`,
      strokes: [], // STORES PATH VECTORS: [{ mode: 'LINED', points: [{x,y}, {x,y}] }]
      visible: true,
      color: defaultColor 
    };

    this.layers.unshift(newLayer);
    this.activeLayerIndex = 0;
    
    this.triggerUIUpdate();
    return newLayer;
  }

  getActiveLayer() {
    return this.layers[this.activeLayerIndex] || null;
  }

  setActiveLayer(index) {
    if (index >= 0 && index < this.layers.length) {
      this.activeLayerIndex = index;
      this.triggerUIUpdate();
    }
  }

  toggleVisibility(index) {
    if (this.layers[index]) {
      this.layers[index].visible = !this.layers[index].visible;
      this.triggerUIUpdate();
    }
  }

  setLayerColor(index, hexColor) {
    if (this.layers[index]) {
      this.layers[index].color = hexColor;
      this.triggerUIUpdate(); // This triggers an app frame redraw with the new color instantly!
    }
  }

  removeLayer(index) {
    if (this.layers.length <= 1) return;
    this.layers.splice(index, 1);
    this.activeLayerIndex = Math.min(this.activeLayerIndex, this.layers.length - 1);
    this.triggerUIUpdate();
  }

  resizeAllLayers(width, height) {
    this.baseWidth = width;
    this.baseHeight = height;
  }

  // FIXED: Added a scale parameter defaulting to 1 to ensure lines scale proportionally during high-res crops
  compositeLayers(targetCtx, scale = 1) {
    // Traverse backwards to preserve stack order (bottom layers draw first)
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      if (!layer.visible) continue;

      // Adjust the brush thickness and dot radius relative to the export scale multiplier
      const scaledWidth = 2 * scale;

      targetCtx.fillStyle = layer.color;
      targetCtx.strokeStyle = layer.color;
      targetCtx.lineWidth = scaledWidth;
      targetCtx.lineCap = "round";
      targetCtx.lineJoin = "round";

      layer.strokes.forEach(stroke => {
        if (stroke.points.length === 0) return;

        if (stroke.mode === "DOTTED") {
          stroke.points.forEach(pt => {
            targetCtx.beginPath();
            // Scale the dot radius proportionally
            targetCtx.arc(pt.x, pt.y, scaledWidth, 0, Math.PI * 2);
            targetCtx.fill();
          });
        } 
        else if (stroke.mode === "LINED") {
          targetCtx.beginPath();
          // FIXED: Corrected mapping syntax point references
          targetCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let p = 1; p < stroke.points.length; p++) {
            targetCtx.lineTo(stroke.points[p].x, stroke.points[p].y);
          }
          targetCtx.stroke();
        }
      });
    }
  }

  triggerUIUpdate() {
    if (this.onLayerChange) this.onLayerChange(this.layers, this.activeLayerIndex);
  }
}
