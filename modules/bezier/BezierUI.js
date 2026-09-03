export default class BezierUI {
  draw(ctx, state, brushColor, isExporting = false) {
    if (state.anchors.length === 0) return;

    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = brushColor || "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(state.anchors[0].x, state.anchors[0].y);

    for (let i = 1; i < state.anchors.length; i++) {
      const prev = state.anchors[i - 1];
      const curr = state.anchors[i];
      ctx.bezierCurveTo(prev.c2.x, prev.c2.y, curr.c1.x, curr.c1.y, curr.x, curr.y);
    }
    ctx.stroke();

    if (isExporting) {
      ctx.restore();
      return;
    }

    for (let i = 0; i < state.anchors.length; i++) {
      const a = state.anchors[i];

      ctx.strokeStyle = "rgba(0, 123, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (i > 0) {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.c1.x, a.c1.y);
      }
      if (i < state.anchors.length - 1) {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.c2.x, a.c2.y);
      }
      ctx.stroke();

      ctx.fillStyle = "#007bff";
      ctx.beginPath();
      ctx.arc(a.x, a.y, state.handleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffc107";
      if (i > 0) {
        ctx.beginPath();
        ctx.arc(a.c1.x, a.c1.y, state.handleRadius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      if (i < state.anchors.length - 1) {
        ctx.beginPath();
        ctx.arc(a.c2.x, a.c2.y, state.handleRadius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
