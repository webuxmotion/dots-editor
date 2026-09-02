export default class ResizeHandle {
  constructor(size = 15, minSize = 50) {
    this.size = size;
    this.minSize = minSize;
    this.isActive = false;
  }

  // Calculates current absolute layout coordinate positions for the vertex
  getBounds(cropRect) {
    const cx = cropRect.x + cropRect.width;
    const cy = cropRect.y + cropRect.height;
    return {
      x: cx - this.size / 2,
      y: cy - this.size / 2,
      width: this.size,
      height: this.size,
    };
  }

  // Tests if the cursor hits this specific vertex bounding box
  checkHit(mouseX, mouseY, cropRect) {
    const bounds = this.getBounds(cropRect);
    
    if (
      mouseX >= bounds.x &&
      mouseX <= bounds.x + bounds.width &&
      mouseY >= bounds.y &&
      mouseY <= bounds.y + bounds.height
    ) {
      this.isActive = true;
      return true;
    }
    return false;
  }

  // Dynamically scales width and height while clamping dimensions above minimum limits
  executeResize(mouseX, mouseY, cropRect) {
    if (!this.isActive) return;

    const newWidth = mouseX - cropRect.x;
    const newHeight = mouseY - cropRect.y;

    cropRect.width = Math.max(this.minSize, newWidth);
    cropRect.height = Math.max(this.minSize, newHeight);
  }

  // Deactivates this control anchor node
  release() {
    this.isActive = false;
  }

  // Draws the anchor square box with inner white accent guidelines
  draw(ctx, cropRect) {
    const bounds = this.getBounds(cropRect);

    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = "#007bff";
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Inner white stroke accent trim decoration
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      bounds.x + 2,
      bounds.y + 2,
      bounds.width - 4,
      bounds.height - 4
    );
    ctx.restore();
  }
}
