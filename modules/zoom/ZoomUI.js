export default class ZoomUI {
  constructor() {
    this.width = 110;
    this.height = 26;
    this.bounds = { x: 0, y: 15, width: this.width, height: this.height };
  }

  updatePosition(canvasWidth) {
    this.bounds.x = (canvasWidth / 2) - (this.width / 2);
  }

  checkHit(mouseX, mouseY, canvasWidth) {
    this.updatePosition(canvasWidth);
    if (
      mouseX >= this.bounds.x &&
      mouseX <= this.bounds.x + this.bounds.width &&
      mouseY >= this.bounds.y &&
      mouseY <= this.bounds.y + this.bounds.height
    ) {
      return mouseX >= this.bounds.x + 55;
    }
    return false;
  }

  draw(ctx, canvasWidth, zoomState) {
    if (!zoomState || !zoomState.isActive) return;

    this.updatePosition(canvasWidth);
    ctx.save();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(20, 20, 20, 0.75)";
    ctx.beginPath();
    ctx.roundRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, 6);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textBaseline = "middle";
    const percentageText = `${Math.round(zoomState.value * 100)}%`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(percentageText, this.bounds.x + 10, this.bounds.y + this.bounds.height / 2);

    ctx.fillStyle = "#007bff";
    ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("RESET", this.bounds.x + this.bounds.width - 10, this.bounds.y + this.bounds.height / 2);

    ctx.restore();
  }
}
