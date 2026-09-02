// crop-manager/SizeLabel.js
export default class SizeLabel {
  // Renders the size string (e.g., "1200 × 800 px") inline right next to the drag button
  draw(ctx, cropRect, dragHandleSize) {
    ctx.save();
    ctx.setLineDash([]);
    
    // Position text exactly 10px to the right of the drag button bounding block
    const textX = cropRect.x + dragHandleSize + 10;
    const textY = cropRect.y - (dragHandleSize / 2);

    ctx.fillStyle = "#007bff"; // Match signature brand blue
    ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const sizeText = `${Math.round(cropRect.width)} × ${Math.round(cropRect.height)} px`;
    ctx.fillText(sizeText, textX, textY);

    ctx.restore();
  }
}
