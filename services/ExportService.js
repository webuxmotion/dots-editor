export default class ExportService {
  static saveCrop(layerManager, cropRect) {
    const dpr = window.devicePixelRatio || 1;
    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = cropRect.width * dpr;
    tempCanvas.height = cropRect.height * dpr;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.scale(dpr, dpr);
    tempCtx.translate(-cropRect.x, -cropRect.y);

    layerManager.compositeLayers(tempCtx, dpr);

    const imageUrl = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageUrl;
    downloadLink.download = "canvas-crop.png";
    downloadLink.click();
  }
}
