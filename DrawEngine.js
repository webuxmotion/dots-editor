// DrawEngine.js
export default class DrawEngine {
  constructor(ctx) {
    this.ctx = ctx;
    this.modes = {
      DOTTED: "DOTTED",
      LINED: "LINED",
    };
    this.currentMode = this.modes.DOTTED;
    this.prevDot = null;
    
    // Global brush settings packaged neatly
    this.brushColor = "white";
    this.brushSize = 2;
  }

  setMode(modeString) {
    if (this.modes[modeString]) {
      this.currentMode = modeString;
    }
  }

  resetStroke() {
    this.prevDot = null;
  }

  // Executes actual pixel mutations strictly on the hidden memory layer context
  executeStroke(mouseState) {
    this.ctx.fillStyle = this.brushColor;
    this.ctx.strokeStyle = this.brushColor;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (this.currentMode === this.modes.DOTTED) {
      this.ctx.beginPath();
      this.ctx.arc(mouseState.x, mouseState.y, this.brushSize, 0, Math.PI * 2);
      this.ctx.fill();
    } 
    else if (this.currentMode === this.modes.LINED) {
      this.ctx.beginPath();
      if (this.prevDot) {
        this.ctx.moveTo(this.prevDot.x, this.prevDot.y);
        this.ctx.lineTo(mouseState.x, mouseState.y);
        this.ctx.stroke();
        this.prevDot.x = mouseState.x;
        this.prevDot.y = mouseState.y;
      } else {
        this.prevDot = { x: mouseState.x, y: mouseState.y };
      }
    }
  }
}
