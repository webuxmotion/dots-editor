// crop-manager/ZoomStatus.js
export default class ZoomStatus {
  constructor() {
    this.width = 110;
    this.height = 26;
    
    // Calculated boundary properties updated on every draw step pass
    this.bounds = { x: 0, y: 15, width: this.width, height: this.height };
  }

  // Updates layout bounds coordinates to snap directly to horizontal viewport centers
  updatePosition(canvasWidth) {
    this.bounds.x = (canvasWidth / 2) - (this.width / 2);
  }

  // Intercepts and validates if user cursor clicks hit the inline "RESET" button zone
  checkHit(mouseX, mouseY, canvasWidth, resetCallback) {
    this.updatePosition(canvasWidth);

    // Verify if bounding box bounds are intercepted
    if (
      mouseX >= this.bounds.x &&
      mouseX <= this.bounds.x + this.bounds.width &&
      mouseY >= this.bounds.y &&
      mouseY <= this.bounds.y + this.bounds.height
    ) {
      // Isolate click check to the right half of the widget (where RESET text resides)
      const isRightSideClick = mouseX >= this.bounds.x + 55;
      if (isRightSideClick && resetCallback) {
        resetCallback();
        return true; // Click intercepted and consumed
      }
    }
    return false;
  }

  // Composites the minimalist dark glass badge wrapper and alphanumeric string elements
  draw(ctx, canvasWidth, currentZoom) {
    this.updatePosition(canvasWidth);

    ctx.save();
    ctx.setLineDash([]);

    // 1. Draw Glassmorphism Badge Container Background Block
    ctx.fillStyle = "rgba(20, 20, 20, 0.75)";
    ctx.beginPath();
    ctx.roundRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, 6);
    ctx.fill();

    // Subtle container border line trim
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Format and render the Zoom Percentage Metric String
    ctx.textBaseline = "middle";
    const percentageText = `${Math.round(currentZoom * 100)}%`;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(percentageText, this.bounds.x + 10, this.bounds.y + this.bounds.height / 2);

    // 3. Render the interactive action reset toggle handle
    ctx.fillStyle = "#007bff"; // Vibrant accent link color
    ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("RESET", this.bounds.x + this.bounds.width - 10, this.bounds.y + this.bounds.height / 2);

    ctx.restore();
  }
}
