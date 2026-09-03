export default class ZoomState {
  constructor() {
    this.value = 1.0;
    this.min = 0.1;
    this.max = 10.0;
    this.factor = 1.02;
  }

  executeZoom(wheelEvent, mouseState, panState) {
    const oldZoom = this.value;

    if (wheelEvent.deltaY < 0) {
      this.value = Math.min(this.max, this.value * this.factor);
    } else {
      this.value = Math.max(this.min, this.value / this.factor);
    }

    panState.x = mouseState.x - (mouseState.x - panState.x) * (this.value / oldZoom);
    panState.y = mouseState.y - (mouseState.y - panState.y) * (this.value / oldZoom);
  }

  reset(panState, currentWidth, currentHeight) {
    const screenCenterX = currentWidth / 2;
    const screenCenterY = currentHeight / 2;

    const virtualCenterX = (screenCenterX - panState.x) / this.value;
    const virtualCenterY = (screenCenterY - panState.y) / this.value;

    this.value = 1.0;
    panState.x = screenCenterX - virtualCenterX;
    panState.y = screenCenterY - virtualCenterY;
  }

  get isActive() {
    return Math.round(this.value * 100) !== 100;
  }
}
