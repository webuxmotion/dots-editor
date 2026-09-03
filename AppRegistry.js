import ColorPicker from "./ColorPicker.js";
import CropManager from "./crop-manager/index.js";
import DrawEngine from "./DrawEngine.js";
import InputManager from "./InputManager.js";
import LayerManager from "./LayerManager.js";
import ZoomStatus from "./crop-manager/ZoomStatus.js";
import Viewport from "./Viewport.js";
import LayersUI from "./LayersUI.js";
import ToolbarUI from "./ToolbarUI.js";

export function bootstrapSystems(app) {
  // 1. Core Engines
  const systems = {
    viewport: new Viewport(),
    layers: new LayerManager(app.width, app.height),
    drawer: new DrawEngine(),
    input: new InputManager(app.canvas),
    zoomStatus: new ZoomStatus()
  };

  // Cross-inject dependencies where explicitly required
  systems.cropper = new CropManager(app.canvas, systems.layers);

  // 2. User Interfaces
  const ui = {
    layers: new LayersUI(systems.layers),
    toolbar: new ToolbarUI(systems.drawer, systems.layers, systems.cropper),
    colorPicker: new ColorPicker("#color")
  };

  return { systems, ui };
}
