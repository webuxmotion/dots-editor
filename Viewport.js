// Viewport.js
export default class Viewport {
  constructor() {
    this.pan = { x: 0, y: 0 };
    this.zoom = 1.0;
    this.minZoom = 0.1;
    this.maxZoom = 10.0;
    this.zoomFactor = 1.02;
  }

  // Adjust physical viewport coordinate markers to map virtual document locations
  toVirtual(screenX, screenY) {
    return {
      x: (screenX - this.pan.x) / this.zoom,
      y: (screenY - this.pan.y) / this.zoom,
    };
  }

  addPan(deltaX, deltaY) {
    this.pan.x -= deltaX;
    this.pan.y -= deltaY;
  }

  executeZoom(zoomData) {
    const oldZoom = this.zoom;

    if (zoomData.deltaY < 0) {
      this.zoom = Math.min(this.maxZoom, this.zoom * this.zoomFactor);
    } else {
      this.zoom = Math.max(this.minZoom, this.zoom / this.zoomFactor);
    }

    // Anchor panning updates directly to current cursor centers
    this.pan.x = zoomData.mouseX - (zoomData.mouseX - this.pan.x) * (this.zoom / oldZoom);
    this.pan.y = zoomData.mouseY - (zoomData.mouseY - this.pan.y) * (this.zoom / oldZoom);
  }

  // Preservation calculations for 100% canvas snaps
  resetToCenter(width, height) {
    const screenCenterX = width / 2;
    const screenCenterY = height / 2;

    const virtualCenterX = (screenCenterX - this.pan.x) / this.zoom;
    const virtualCenterY = (screenCenterY - this.pan.y) / this.zoom;

    this.zoom = 1.0;
    this.pan.x = screenCenterX - virtualCenterX;
    this.pan.y = screenCenterY - virtualCenterY;
  }

  // Applies transformation matrices to canvas layers prior to painting
  applyTransform(ctx) {
    ctx.translate(this.pan.x, this.pan.y);
    ctx.scale(this.zoom, this.zoom);
  }

  get isZoomed() {
    return Math.round(this.zoom * 100) !== 100;
  }
}
