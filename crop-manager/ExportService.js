// crop-manager/ExportService.js
export default class ExportService {
  static saveCrop(layerManager, cropRect) {
    const dpr = window.devicePixelRatio || 1;
    const tempCanvas = document.createElement("canvas");

    // Configure the high-res canvas dimensions
    tempCanvas.width = cropRect.width * dpr;
    tempCanvas.height = cropRect.height * dpr;
    const tempCtx = tempCanvas.getContext("2d");

    // Scale the context matrix to support sharp exports
    tempCtx.scale(dpr, dpr);
    
    // Shift context window to match our clipping box origin coordinates
    tempCtx.translate(-cropRect.x, -cropRect.y);

    // FIXED: Pass the high-res dpr scale value down to scale your vector dots and lines perfectly
    layerManager.compositeLayers(tempCtx, dpr);

    // Encode and download the image
    const imageUrl = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageUrl;
    downloadLink.download = "canvas-crop.png";
    downloadLink.click();
  }
}
