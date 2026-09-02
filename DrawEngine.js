// DrawEngine.js
export default class DrawEngine {
  constructor() {
    this.modes = {
      DOTTED: "DOTTED",
      LINED: "LINED",
    };
    this.currentMode = this.modes.DOTTED;
    this.currentStroke = null; // Tracks the active mouse stroke
  }

  setMode(modeString) {
    if (this.modes[modeString]) this.currentMode = modeString;
  }

  // Called immediately on mousedown to start a new coordinate group
  startStroke(activeLayer, mouseState) {
    if (!activeLayer) return;

    this.currentStroke = {
      mode: this.currentMode,
      points: [{ x: mouseState.x, y: mouseState.y }]
    };

    activeLayer.strokes.push(this.currentStroke);
  }

  // Called on mousemove to append new coordinate points to the active stroke
  continueStroke(mouseState) {
    if (!this.currentStroke) return;

    if (this.currentMode === this.modes.DOTTED) {
      this.currentStroke.points.push({ x: mouseState.x, y: mouseState.y });
    } 
    else if (this.currentMode === this.modes.LINED) {
      this.currentStroke.points.push({ x: mouseState.x, y: mouseState.y });
    }
  }

  // Called on mouseup
  resetStroke() {
    this.currentStroke = null;
  }
}
