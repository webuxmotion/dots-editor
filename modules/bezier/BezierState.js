export default class BezierState {
  constructor() {
    this.anchors = [];
    this.selectedElement = null;
    this.handleRadius = 8;
  }

  addAnchor(x, y) {
    let c1 = { x: x - 40, y: y };
    let c2 = { x: x + 40, y: y };

    if (this.anchors.length > 0) {
      const prev = this.anchors[this.anchors.length - 1];
      c1.x = prev.x + (x - prev.x) * 0.25;
      c1.y = prev.y + (y - prev.y) * 0.25;
      c2.x = x - (x - prev.x) * 0.25;
      c2.y = y - (y - prev.y) * 0.25;
    }

    this.anchors.push({ x, y, c1, c2 });
  }

  checkHit(mouseX, mouseY) {
    for (let i = 0; i < this.anchors.length; i++) {
      const a = this.anchors[i];
      
      if (this.isHit(mouseX, mouseY, a.x, a.y)) {
        this.selectedElement = { type: "anchor", index: i };
        return true;
      }
      
      if (i > 0 && this.isHit(mouseX, mouseY, a.c1.x, a.c1.y)) {
        this.selectedElement = { type: "c1", index: i };
        return true;
      }
      
      if (i < this.anchors.length - 1 && this.isHit(mouseX, mouseY, a.c2.x, a.c2.y)) {
        this.selectedElement = { type: "c2", index: i };
        return true;
      }
    }
    return false;
  }

  isHit(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy <= this.handleRadius * this.handleRadius;
  }

  handleMove(mouseX, mouseY) {
    if (!this.selectedElement) return;

    const { type, index } = this.selectedElement;
    const a = this.anchors[index];

    if (type === "anchor") {
      const dx = mouseX - a.x;
      const dy = mouseY - a.y;
      a.x = mouseX;
      a.y = mouseY;
      a.c1.x += dx;
      a.c1.y += dy;
      a.c2.x += dx;
      a.c2.y += dy;
    } else if (type === "c1") {
      a.c1.x = mouseX;
      a.c1.y = mouseY;
      
      const dx = a.x - mouseX;
      const dy = a.y - mouseY;
      a.c2.x = a.x + dx;
      a.c2.y = a.y + dy;
    } else if (type === "c2") {
      a.c2.x = mouseX;
      a.c2.y = mouseY;
      
      const dx = a.x - mouseX;
      const dy = a.y - mouseY;
      a.c1.x = a.x + dx;
      a.c1.y = a.y + dy;
    }
  }

  stopDragging() {
    this.selectedElement = null;
  }
}
