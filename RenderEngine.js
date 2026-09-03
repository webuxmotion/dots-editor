export class RenderEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(app, systems) {
    const { ctx } = this;
    const { viewport } = systems;

    ctx.clearRect(0, 0, app.width, app.height);

    ctx.save();
    viewport.applyTransform(ctx);

    ctx.restore();
  }

  startLoop(renderCallback) {
    const loop = (time) => {
      renderCallback(time);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
