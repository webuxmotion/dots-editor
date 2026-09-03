import ColorPicker from "./ColorPicker.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";
import LayerManager from "./LayerManager.js";
import Viewport from "./Viewport.js";
import LayersUI from "./LayersUI.js";
import ToolbarUI from "./ToolbarUI.js";

export function bootstrapSystems(app) {
  const systems = {
    viewport: new Viewport(),
    layers: new LayerManager(app.width, app.height),
    drawer: new DrawEngine(),
    input: new InputManager(app.canvas)
  };

  const ui = {
    layers: new LayersUI(systems.layers),
    toolbar: new ToolbarUI(systems.drawer, systems.layers),
    colorPicker: new ColorPicker("#color")
  };

  return { systems, ui };
}
