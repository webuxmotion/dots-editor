export default class CropManager {
  constructor(canvas, drawingCanvas) {
    this.canvas = canvas;
    this.drawingCanvas = drawingCanvas;

    this.cropRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    this.dragBoxSize = 30;
    this.resizeHandleSize = 15;
    this.minSize = 50;

    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };

    this.dragIcon = new Image();
    this.dragIcon.src = "/images/drag-icon.png";
  }

  checkHit(mouseX, mouseY) {
    const resizeX = this.cropRect.x + this.cropRect.width;
    const resizeY = this.cropRect.y + this.cropRect.height;

    if (
      mouseX >= resizeX - this.resizeHandleSize &&
      mouseX <= resizeX + this.resizeHandleSize &&
      mouseY >= resizeY - this.resizeHandleSize &&
      mouseY <= resizeY + this.resizeHandleSize
    ) {
      this.isResizing = true;
      return true;
    }

    const dragBoxX = this.cropRect.x;
    const dragBoxY = this.cropRect.y - this.dragBoxSize;

    if (
      mouseX >= dragBoxX &&
      mouseX <= dragBoxX + this.dragBoxSize &&
      mouseY >= dragBoxY &&
      mouseY <= dragBoxY + this.dragBoxSize
    ) {
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
    } else if (this.isResizing) {
      let newWidth = mouseX - this.cropRect.x;
      let newHeight = mouseY - this.cropRect.y;

      this.cropRect.width = Math.max(this.minSize, newWidth);
      this.cropRect.height = Math.max(this.minSize, newHeight);
    }
  }

  stopDragging() {
    this.isDragging = false;
    this.isResizing = false;
  }

  draw(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(
      this.cropRect.x,
      this.cropRect.y,
      this.cropRect.width,
      this.cropRect.height,
    );
    ctx.strokeStyle = "#007bff";
    ctx.fillStyle = "#007bff";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();

    const dragBoxX = this.cropRect.x;
    const dragBoxY = this.cropRect.y - this.dragBoxSize;
    ctx.setLineDash([]);
    ctx.fillRect(dragBoxX, dragBoxY, this.dragBoxSize, this.dragBoxSize);

    if (this.dragIcon.complete && this.dragIcon.naturalWidth !== 0) {
      ctx.drawImage(
        this.dragIcon,
        dragBoxX + 4,
        dragBoxY + 4,
        this.dragBoxSize - 8,
        this.dragBoxSize - 8,
      );
    }

    const resizeX = this.cropRect.x + this.cropRect.width;
    const resizeY = this.cropRect.y + this.cropRect.height;

    ctx.beginPath();
    ctx.fillRect(
      resizeX - this.resizeHandleSize / 2,
      resizeY - this.resizeHandleSize / 2,
      this.resizeHandleSize,
      this.resizeHandleSize,
    );

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      resizeX - this.resizeHandleSize / 2 + 2,
      resizeY - this.resizeHandleSize / 2 + 2,
      this.resizeHandleSize - 4,
      this.resizeHandleSize - 4,
    );

    ctx.restore();
  }
}
