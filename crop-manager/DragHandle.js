// crop-manager/DragHandle.js
export default class DragHandle {
  constructor(size = 30) {
    this.size = size;
    this.dragIcon = new Image();
    this.dragIcon.src = "/images/drag-icon.png";
  }

  // Gets the exact bounding block of the handle
  getBounds(cropRect) {
    return {
      x: cropRect.x,
      y: cropRect.y - this.size,
      width: this.size,
      height: this.size
    };
  }

  // Tests if the cursor clicked inside the drag handle bounding box
  checkHit(mouseX, mouseY, cropRect) {
    const bounds = this.getBounds(cropRect);
    return (
      mouseX >= bounds.x &&
      mouseX <= bounds.x + bounds.width &&
      mouseY >= bounds.y &&
      mouseY <= bounds.y + bounds.height
    );
  }

  // Renders the solid block button and overlays the local icon
  draw(ctx, cropRect) {
    const bounds = this.getBounds(cropRect);

    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = "#007bff";
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    if (this.dragIcon.complete && this.dragIcon.naturalWidth !== 0) {
      ctx.drawImage(
        this.dragIcon,
        bounds.x + 4,
        bounds.y + 4,
        bounds.width - 8,
        bounds.height - 8
      );
    }
    ctx.restore();
  }
}
