// crop-manager/index.js
import ResizeHandle from "./ResizeHandle.js";
import DragHandle from "./DragHandle.js";
import SizeLabel from "./SizeLabel.js"; // Import the new text label component

export default class CropManager {
  constructor(canvas, drawingCanvas) {
    this.canvas = canvas;
    this.drawingCanvas = drawingCanvas;
    
    // Explicit padding specifications
    const paddingLeft = 100;
    const paddingRight = 100;
    const paddingTop = 200;
    const paddingBottom = 100;

    // Dynamically compute bounds using window viewport dimensions and padding metrics
    const initialWidth = window.innerWidth - paddingLeft - paddingRight;
    const initialHeight = window.innerHeight - paddingTop - paddingBottom;

    this.cropRect = {
      x: paddingLeft,               // Start exactly 100px from left screen margin
      y: paddingTop,                // Start exactly 200px from top screen margin
      width: Math.max(50, initialWidth),   // Safe clamp width boundaries
      height: Math.max(50, initialHeight), // Safe clamp height boundaries
    };

    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // Instantiate modular sub-components smoothly
    this.dragHandleSize = 30;
    this.dragHandle = new DragHandle(this.dragHandleSize);
    this.resizeHandle = new ResizeHandle(15, 50);
    
    // FIXED: Instantiate the new label manager instead of the old canvas Toolbar button
    this.sizeLabel = new SizeLabel();
  }

  get isResizing() {
    return this.resizeHandle.isActive;
  }

  checkHit(mouseX, mouseY) {
    // 1. Delegate to the decoupled Resize handle interface
    if (this.resizeHandle.checkHit(mouseX, mouseY, this.cropRect)) {
      return true;
    }

    // 2. Delegate to the decoupled Move Drag handle interface
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
    ctx.setLineDash([2, 15]);
    ctx.stroke();

    // Composite separate child element interface overlays onto presentation thread
    this.dragHandle.draw(ctx, this.cropRect);
    this.resizeHandle.draw(ctx, this.cropRect);
    
    // FIXED: Draw the live text label next to the drag handle button
    this.sizeLabel.draw(ctx, this.cropRect, this.dragHandleSize);

    ctx.restore();
  }
}
