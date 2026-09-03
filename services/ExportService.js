export default class ExportService {
  static saveRegion(layerManager, bounds) {
    const dpr = window.devicePixelRatio || 1;
    const tempCanvas = document.createElement("canvas");

    tempCanvas.width = bounds.width * dpr;
    tempCanvas.height = bounds.height * dpr;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.scale(dpr, dpr);
    tempCtx.translate(-bounds.x, -bounds.y);

    layerManager.compositeLayers(tempCtx, dpr);

    const imageUrl = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = imageUrl;
    downloadLink.download = "canvas-export.png";
    downloadLink.click();
  }
}
