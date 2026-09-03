export default class Viewport {
  constructor() {
    this.pan = { x: 0, y: 0 };
  }

  toVirtual(screenX, screenY) {
    return {
      x: screenX - this.pan.x,
      y: screenY - this.pan.y
    };
  }

  addPan(deltaX, deltaY) {
    this.pan.x -= deltaX;
    this.pan.y -= deltaY;
  }

  applyTransform(ctx) {
    ctx.translate(this.pan.x, this.pan.y);
  }
}
