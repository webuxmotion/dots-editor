export default class CropManager {
  constructor(canvas, drawingCanvas) {
    this.canvas = canvas;
    this.drawingCanvas = drawingCanvas;
    this.isVisible = false;
    this.showConfirmation = false;

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
    
    this.btnWidth = 45;
    this.btnHeight = 20;
  }

  checkHit(mouseX, mouseY) {
    if (!this.isVisible) return false;

    if (this.showConfirmation) {
      const tooltipW = 175;
      const tooltipH = 40;
      const tooltipX = this.cropRect.x + (this.cropRect.width / 2) - (tooltipW / 2);
      const tooltipY = this.cropRect.y - (tooltipH + 10);
      
      const okBtnX = tooltipX + 70;
      const cancelBtnX = tooltipX + 120;
      const btnY = tooltipY + 10;

      if (mouseX >= okBtnX && mouseX <= okBtnX + this.btnWidth && mouseY >= btnY && mouseY <= btnY + this.btnHeight) {
        return "OK";
      }
      if (mouseX >= cancelBtnX && mouseX <= cancelBtnX + this.btnWidth && mouseY >= btnY && mouseY <= btnY + this.btnHeight) {
        return "CANCEL";
      }
      return true;
    }

    const dragBoxX = this.cropRect.x;
    const dragBoxY = this.cropRect.y - this.dragBoxSize;

    const minimizeX = dragBoxX + this.dragBoxSize + 4;
    if (
      mouseX >= minimizeX &&
      mouseX <= minimizeX + this.dragBoxSize &&
      mouseY >= dragBoxY &&
      mouseY <= dragBoxY + this.dragBoxSize
    ) {
      return "MINIMIZE";
    }

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
    if (!this.isVisible || this.showConfirmation) return;

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
    if (!this.isVisible) return;

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
    ctx.setLineDash([]);
    ctx.stroke();

    const dragBoxX = this.cropRect.x;
    const dragBoxY = this.cropRect.y - this.dragBoxSize;
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

    const minimizeX = dragBoxX + this.dragBoxSize + 4;
    ctx.fillStyle = "#242424";
    ctx.fillRect(minimizeX, dragBoxY, this.dragBoxSize, this.dragBoxSize);
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(minimizeX, dragBoxY, this.dragBoxSize, this.dragBoxSize);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("−", minimizeX + this.dragBoxSize / 2, dragBoxY + this.dragBoxSize / 2);

    const resizeX = this.cropRect.x + this.cropRect.width;
    const resizeY = this.cropRect.y + this.cropRect.height;

    ctx.fillStyle = "#007bff";
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

    if (this.showConfirmation) {
      const tooltipW = 175;
      const tooltipH = 40;
      const tooltipX = this.cropRect.x + (this.cropRect.width / 2) - (tooltipW / 2);
      const tooltipY = this.cropRect.y - (tooltipH + 10);

      ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipW, tooltipH, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText("Want to save this area?", tooltipX + 8, tooltipY + 6);

      const btnY = tooltipY + 10;
      
      const okX = tooltipX + 70;
      ctx.fillStyle = "#28a745";
      ctx.beginPath();
      ctx.roundRect(okX, btnY, this.btnWidth, this.btnHeight, 4);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("OK", okX + this.btnWidth / 2, btnY + this.btnHeight / 2);

      const cancelX = tooltipX + 120;
      ctx.fillStyle = "#dc3545";
      ctx.beginPath();
      ctx.roundRect(cancelX, btnY, this.btnWidth, this.btnHeight, 4);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Cancel", cancelX + this.btnWidth / 2, btnY + this.btnHeight / 2);
    }

    ctx.restore();
  }
}
