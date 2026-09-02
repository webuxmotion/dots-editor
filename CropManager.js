export default class CropManager {
  constructor(canvas, drawingCanvas) {
    this.canvas = canvas;
    this.drawingCanvas = drawingCanvas;
    
    this.cropRect = {
      x: 50,
      y: 50,
      width: 500,
      height: 500,
    };

    this.dragBoxSize = 30;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // Initialize drag handle icon asset
    this.dragIcon = new Image();
    this.dragIcon.src = "/images/drag-icon.png";

    this.setupDownloadButton();
  }

  // Checks if a given coordinate hits the drag handle area
  checkHit(mouseX, mouseY) {
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
      return true; // Click intercepted by UI handle
    }
    return false;
  }

  // Updates box positions during mouse movements
  handleMove(mouseX, mouseY) {
    if (this.isDragging) {
      this.cropRect.x = mouseX - this.dragOffset.x;
      this.cropRect.y = mouseY - this.dragOffset.y;
    }
  }

  // Releases drag states
  stopDragging() {
    this.isDragging = false;
  }

  // Renders the dashed box boundary and icon overlay
  draw(ctx) {
    ctx.save();

    // 1. Draw crop selector boundary box
    ctx.beginPath();
    ctx.rect(this.cropRect.x, this.cropRect.y, this.cropRect.width, this.cropRect.height);
    ctx.strokeStyle = "#007bff";
    ctx.fillStyle = "#007bff";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();

    // 2. Build button node container
    const dragBoxX = this.cropRect.x;
    const dragBoxY = this.cropRect.y - this.dragBoxSize;
    ctx.setLineDash([]);
    ctx.fillRect(dragBoxX, dragBoxY, this.dragBoxSize, this.dragBoxSize);

    // 3. Render PNG icon asset safely
    if (this.dragIcon.complete && this.dragIcon.naturalWidth !== 0) {
      ctx.drawImage(
        this.dragIcon,
        dragBoxX + 4,
        dragBoxY + 4,
        this.dragBoxSize - 8,
        this.dragBoxSize - 8
      );
    }

    ctx.restore();
  }

  // Connects DOM click handling cleanly to current instance boundaries
  setupDownloadButton() {
    const saveBtn = document.getElementById("crop-and-save");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", () => {
      const dpr = window.devicePixelRatio || 1;
      const tempCanvas = document.createElement("canvas");

      tempCanvas.width = this.cropRect.width * dpr;
      tempCanvas.height = this.cropRect.height * dpr;
      const tempCtx = tempCanvas.getContext("2d");

      // Harvest image slice exclusively from internal vector memory backing layer
      tempCtx.drawImage(
        this.drawingCanvas,
        this.cropRect.x * dpr,
        this.cropRect.y * dpr,
        this.cropRect.width * dpr,
        this.cropRect.height * dpr,
        0,
        0,
        this.cropRect.width * dpr,
        this.cropRect.height * dpr
      );

      const imageUrl = tempCanvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = "canvas-crop.png";
      downloadLink.click();
    });
  }
}
