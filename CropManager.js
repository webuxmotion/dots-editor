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
    this.resizeHandleSize = 15; // Size of the bottom-right interactive handle node
    this.minSize = 50;          // Prevent collapsing the box to 0 or negative sizes

    this.isDragging = false;
    this.isResizing = false;    // New tracking state for resizing calculations
    this.dragOffset = { x: 0, y: 0 };

    // Initialize drag handle icon asset
    this.dragIcon = new Image();
    this.dragIcon.src = "/images/drag-icon.png";

    this.setupDownloadButton();
  }

  // Checks if a given coordinate hits the drag handle OR the resize handle area
  checkHit(mouseX, mouseY) {
    // 1. Check Bottom-Right Resize Handle Hit
    const resizeX = this.cropRect.x + this.cropRect.width;
    const resizeY = this.cropRect.y + this.cropRect.height;

    if (
      mouseX >= resizeX - this.resizeHandleSize &&
      mouseX <= resizeX + this.resizeHandleSize &&
      mouseY >= resizeY - this.resizeHandleSize &&
      mouseY <= resizeY + this.resizeHandleSize
    ) {
      this.isResizing = true;
      return true; // Intercepted by Resize Handle
    }

    // 2. Check Top-Left Drag Move Handle Hit
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
      return true; // Intercepted by Drag Handle
    }

    return false;
  }

  // Updates positions or scaling dimensions during mouse movements
  handleMove(mouseX, mouseY) {
    if (this.isDragging) {
      this.cropRect.x = mouseX - this.dragOffset.x;
      this.cropRect.y = mouseY - this.dragOffset.y;
    } 
    else if (this.isResizing) {
      // New Width/Height is calculated based on current mouse coordinate minus current box origin point
      let newWidth = mouseX - this.cropRect.x;
      let newHeight = mouseY - this.cropRect.y;

      // Restrict resizing below minimum limits to prevent inversions
      this.cropRect.width = Math.max(this.minSize, newWidth);
      this.cropRect.height = Math.max(this.minSize, newHeight);
    }
  }

  // Releases all interactive tracking states
  stopDragging() {
    this.isDragging = false;
    this.isResizing = false; // Reset resize marker
  }

  // Renders the dashed box boundary, drag handle, and bottom-right resize node
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

    // 2. Build Top-Left Move button node container
    const dragBoxX = this.cropRect.x;
    const dragBoxY = this.cropRect.y - this.dragBoxSize;
    ctx.setLineDash([]);
    ctx.fillRect(dragBoxX, dragBoxY, this.dragBoxSize, this.dragBoxSize);

    // 3. Render PNG icon asset safely inside move handle
    if (this.dragIcon.complete && this.dragIcon.naturalWidth !== 0) {
      ctx.drawImage(
        this.dragIcon,
        dragBoxX + 4,
        dragBoxY + 4,
        this.dragBoxSize - 8,
        this.dragBoxSize - 8
      );
    }

    // 4. Build Bottom-Right Resize Handle node indicator
    const resizeX = this.cropRect.x + this.cropRect.width;
    const resizeY = this.cropRect.y + this.cropRect.height;
    
    ctx.beginPath();
    // Centered anchor node block over the exact point vertex line intersection
    ctx.fillRect(
      resizeX - this.resizeHandleSize / 2, 
      resizeY - this.resizeHandleSize / 2, 
      this.resizeHandleSize, 
      this.resizeHandleSize
    );
    
    // Add white inner accent border trim to distinguish it clearly as an accent handle
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      resizeX - this.resizeHandleSize / 2 + 2, 
      resizeY - this.resizeHandleSize / 2 + 2, 
      this.resizeHandleSize - 4, 
      this.resizeHandleSize - 4
    );

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

      // Harvest image slice exclusively from internal vector memory backing layer using active size parameters
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
