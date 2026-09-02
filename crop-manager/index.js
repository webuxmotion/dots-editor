// crop-manager/index.js
import ResizeHandle from "./ResizeHandle.js";
import DragHandle from "./DragHandle.js";
import Toolbar from "./Toolbar.js";

export default class CropManager {
  constructor(canvas, drawingCanvas) {
    this.canvas = canvas;
    this.drawingCanvas = drawingCanvas;
    
    // Explicitly define default box dimensions
    const boxWidth = 500;
    const boxHeight = 500;

    // Mathematically calculate screen centers dynamically on launch layout cycles
    // (window size / 2) offsets to screen center, subtracting half the box sizes forces perfect centering alignment
    this.cropRect = {
      x: (window.innerWidth / 2) - (boxWidth / 2),
      y: (window.innerHeight / 2) - (boxHeight / 2),
      width: boxWidth,
      height: boxHeight,
    };

    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // Instantiate modular sub-components smoothly
    this.dragHandle = new DragHandle(30);
    this.resizeHandle = new ResizeHandle(15, 50);
    
    // Pass the internal offscreen canvas manager layer directly into the engine handler
    this.toolbar = new Toolbar(this.drawingCanvas);
  }

  get isResizing() {
    return this.resizeHandle.isActive;
  }

  checkHit(mouseX, mouseY) {
    // 1. Check if user clicked the native canvas toolbar action button first
    if (this.toolbar.checkHit(mouseX, mouseY, this.cropRect)) {
      return true;
    }

    // 2. Delegate to the decoupled Resize handle interface
    if (this.resizeHandle.checkHit(mouseX, mouseY, this.cropRect)) {
      return true;
    }

    // 3. Delegate to the decoupled Move Drag handle interface
    if (this.dragHandle.checkHit(mouseX, mouseY, this.cropRect)) {
      this.isDragging = true;
      this.dragOffset.x = mouseX - this.cropRect.x;
      this.dragOffset.y = mouseY - this.cropRect.y;
      return true;
    }

    return false;
  }

  handleMove(mouseX, mouseY) {
    if (this.isDragging) {
      this.cropRect.x = mouseX - this.dragOffset.x;
      this.cropRect.y = mouseY - this.dragOffset.y;
    } 
    else if (this.isResizing) {
      this.resizeHandle.executeResize(mouseX, mouseY, this.cropRect);
    }
  }

  stopDragging() {
    this.isDragging = false;
    this.resizeHandle.release();
  }

  draw(ctx) {
    ctx.save();

    // Draw main selector outline boundary path frame
    ctx.beginPath();
    ctx.rect(this.cropRect.x, this.cropRect.y, this.cropRect.width, this.cropRect.height);
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 5]);
    ctx.stroke();

    // Composite separate child element interface overlays onto presentation thread
    this.dragHandle.draw(ctx, this.cropRect);
    this.resizeHandle.draw(ctx, this.cropRect);
    this.toolbar.draw(ctx, this.cropRect); // Renders button directly on top grid canvas coordinate assets

    ctx.restore();
  }
}
