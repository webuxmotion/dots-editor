export default class DrawEngine {
  constructor() {
    this.modes = {
      DOTTED: "DOTTED",
      LINED: "LINED"
    };
    this.currentMode = this.modes.DOTTED;
    this.currentStroke = null;
  }

  setMode(modeString) {
    if (this.modes[modeString]) this.currentMode = modeString;
  }

  startStroke(mouseState) {
    this.currentStroke = {
      mode: this.currentMode,
      points: [{ x: mouseState.x, y: mouseState.y }]
    };
    return this.currentStroke;
  }

  continueStroke(mouseState) {
    if (!this.currentStroke) return null;
    
    this.currentStroke.points.push({ x: mouseState.x, y: mouseState.y });
    return this.currentStroke;
  }

  resetStroke() {
    this.currentStroke = null;
  }
}
