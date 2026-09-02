// crop-manager/ExportService.js
export default class ExportService {
  static saveCrop(drawingCanvas, cropRect) {
    const dpr = window.devicePixelRatio || 1;
    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = cropRect.width * dpr;
    tempCanvas.height = cropRect.height * dpr;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(
      drawingCanvas,
      cropRect.x * dpr,
      cropRect.y * dpr,
      cropRect.width * dpr,
      cropRect.height * dpr,
      0,
      0,
      cropRect.width * dpr,
      cropRect.height * dpr
    );

    const imageUrl = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageUrl;
    downloadLink.download = "canvas-crop.png";
    downloadLink.click();
  }
}
