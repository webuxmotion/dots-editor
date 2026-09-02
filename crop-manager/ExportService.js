// crop-manager/ExportService.js
export default class ExportService {
  static saveCrop(layerManager, cropRect) {
    const dpr = window.devicePixelRatio || 1;
    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = cropRect.width * dpr;
    tempCanvas.height = cropRect.height * dpr;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.scale(dpr, dpr);
    
    // Shift context window to match our clipping box alignment values
    tempCtx.translate(-cropRect.x, -cropRect.y);

    // Redraw the entire path vectors strictly inside our temporary crop boundary viewport
    layerManager.compositeLayers(tempCtx);

    const imageUrl = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageUrl;
    downloadLink.download = "canvas-crop.png";
    downloadLink.click();
  }
}
