import ColorPicker from "./ColorPicker.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const modes = {
  DOTTED: "DOTTED",
  LINED: "LINED",
};

let width, height;
new ColorPicker("#color");
const mouse = { x: 0, y: 0, isDown: false };
let mode = modes.DOTTED;
let prevDot = null;

let cropRect = {
  x: 50,
  y: 50,
  width: 500,
  height: 500,
};

function init() {
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  width = window.innerWidth;
  height = window.innerHeight;
  ctx.scale(dpr, dpr);
}

let prevTime = 0;

function update() {}
function draw(ctx) {
  drawCropRect(ctx);
}
function loop(time) {
  const delta = (time - prevTime) / 1000;

  update();
  draw(ctx);

  requestAnimationFrame(loop);
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;

  if (mouse.isDown) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    if (mode == modes.DOTTED) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2, 0);
      ctx.fill();
    } else if (mode == modes.LINED) {
      ctx.beginPath();
      if (prevDot) {
        ctx.moveTo(prevDot.x, prevDot.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        prevDot.x = mouse.x;
        prevDot.y = mouse.y;
      } else {
        prevDot = {};
        prevDot.x = mouse.x;
        prevDot.y = mouse.y;
      }
    }
  }
});

canvas.addEventListener("mousedown", () => {
  mouse.isDown = true;
});

canvas.addEventListener("mouseup", () => {
  mouse.isDown = false;
  prevDot = null;
});

const container = document.getElementById("mode-container");
const buttons = container.querySelectorAll("button");
buttons.forEach((button) => {
  const bMode = button.id;
  if (bMode == mode) {
    button.classList.add("is-active");
  }
});

container.addEventListener("click", (event) => {
  const buttons = container.querySelectorAll("button");

  if (event.target.tagName === "BUTTON") {
    const bMode = event.target.id;

    buttons.forEach((button) => {
      button.classList.remove("is-active");
    });

    if (bMode === modes.DOTTED) {
      mode = modes.DOTTED;
      event.target.classList.add("is-active");
    } else if (bMode === modes.LINED) {
      mode = modes.LINED;
      event.target.classList.add("is-active");
    }
  }
});

const saveBtn = document.getElementById("crop-and-save");

saveBtn.addEventListener("click", () => {
  // Get the current display pixel ratio
  const dpr = window.devicePixelRatio || 1;

  const tempCanvas = document.createElement("canvas");
  
  // 1. Scale the temporary canvas size to match the high-res image data
  tempCanvas.width = cropRect.width * dpr;
  tempCanvas.height = cropRect.height * dpr;
  const tempCtx = tempCanvas.getContext("2d");

  // 2. Multiply ALL source coordinates by the dpr multiplier
  tempCtx.drawImage(
    canvas,
    cropRect.x * dpr,      // Scaled X position
    cropRect.y * dpr,      // Scaled Y position
    cropRect.width * dpr,  // Scaled Source Width
    cropRect.height * dpr, // Scaled Source Height
    0,
    0,
    cropRect.width * dpr,  // Destination Width
    cropRect.height * dpr  // Destination Height
  );

  const imageUrl = tempCanvas.toDataURL("image/png");

  const downloadLink = document.createElement("a");
  downloadLink.href = imageUrl;
  downloadLink.download = "canvas-crop.png";

  downloadLink.click();
});


function drawCropRect(ctx) {
  ctx.save();

  ctx.beginPath();
  ctx.rect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  ctx.stroke();
  ctx.restore();
}

window.addEventListener("resize", init);
init();
loop(performance.now());
