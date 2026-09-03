export class RenderEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(app, systems) {
    const { ctx } = this;
    const { viewport, layers, cropper, zoomStatus } = systems;

    // Clear primary workspace viewport frame
    ctx.clearRect(0, 0, app.width, app.height);

    // Render infinite canvas matrix space transformations
    ctx.save();
    viewport.applyTransform(ctx);

    layers.compositeLayers(ctx);
    cropper.draw(ctx);

    ctx.restore();

    // Render fixed/sticky screen space overlays on top
    zoomStatus.draw(ctx, app.width, viewport);
  }

  startLoop(renderCallback) {
    const loop = (time) => {
      renderCallback(time);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
