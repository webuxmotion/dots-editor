// crop-manager/Toolbar.js
import ExportService from "./ExportService.js";

export default class Toolbar {
  constructor(drawingCanvas) {
    this.drawingCanvas = drawingCanvas;
    
    // Explicit padding and dimension values for the button
    this.width = 80; 
    this.height = 25;
    
    // Bounds parameters tracked dynamically every frame execution
    this.bounds = { x: 0, y: 0, width: this.width, height: this.height };
  }

  // Calculates structural screen positions above the top-right crop region frame
  updatePosition(cropRect) {
    // 1. Right side of the button is flush with the right vertical line
    this.bounds.x = (cropRect.x + cropRect.width) - this.width;
    
    // 2. Bottom side of the button sits 5px above the top border line
    this.bounds.y = cropRect.y - this.height - 5;
  }

  // Verifies if user mouse interactions hit the exact vector boundary box points
  checkHit(mouseX, mouseY, cropRect) {
    // Ensure boundaries are up to date before running the validation check
    this.updatePosition(cropRect);

    if (
      mouseX >= this.bounds.x &&
      mouseX <= this.bounds.x + this.bounds.width &&
      mouseY >= this.bounds.y &&
      mouseY <= this.bounds.y + this.bounds.height
    ) {
      // Execute the decoupled static file encoder utility immediately
      ExportService.saveCrop(this.drawingCanvas, cropRect);
      return true; // Click safely captured by internal toolbar actions
    }
    return false;
  }

  // Renders a high-performance vector graphical button framework directly to the frame layer
  draw(ctx, cropRect) {
    this.updatePosition(cropRect);

    ctx.save();
    
    // ------------------------------------------------------------------
    // 1. RENDER SIZE LABEL (To the left of the button)
    // ------------------------------------------------------------------
    ctx.setLineDash([]);
    ctx.fillStyle = "#007bff"; // Matching your signature blue color
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "right";    // Aligns the text cleanly against the button's left side
    ctx.textBaseline = "middle";

    // Format the size string (e.g., "500 × 500 px")
    // Math.round keeps it clean if any subpixel scaling occurs
    const sizeText = `${Math.round(cropRect.width)} × ${Math.round(cropRect.height)} px`;
    
    // Position text 10px to the left of the button background block
    const labelX = this.bounds.x - 10;
    const labelY = this.bounds.y + this.bounds.height / 2;
    ctx.fillText(sizeText, labelX, labelY);

    // ------------------------------------------------------------------
    // 2. DRAW BUTTON BACKGROUND
    // ------------------------------------------------------------------
    ctx.fillStyle = "#007bff";
    ctx.beginPath();
    ctx.roundRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, 4);
    ctx.fill();

    // ------------------------------------------------------------------
    // 3. OVERLAY BUTTON TEXT
    // ------------------------------------------------------------------
    ctx.fillStyle = "white";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const textX = this.bounds.x + this.bounds.width / 2;
    const textY = this.bounds.y + this.bounds.height / 2;
    ctx.fillText("SAVE CROP", textX, textY);

    ctx.restore();
  }
}
