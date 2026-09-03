import ColorPicker from "./ColorPicker.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";
import Viewport from "./Viewport.js";
import ToolbarUI from "./ToolbarUI.js";

export function bootstrapSystems(app) {
  const systems = {
    viewport: new Viewport(),
    drawer: new DrawEngine(),
    input: new InputManager(app.canvas)
  };

  const ui = {
    toolbar: new ToolbarUI(systems.drawer),
    colorPicker: new ColorPicker("#color")
  };

  return { systems, ui };
}
