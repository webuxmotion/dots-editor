import ColorPicker from "./ColorPicker.js";
import CropManager from "./CropManager.js"; // Import the extracted class module

// 1. Visible Canvas (Handles UI rendering & mouse events)
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 2. Offscreen Canvas (Saves and protects user drawings from frame-clears)
const drawingCanvas = document.createElement("canvas");
const dCtx = drawingCanvas.getContext("2d");

const modes = {
  DOTTED: "DOTTED",
  LINED: "LINED",
};

let width, height;
new ColorPicker("#color");

const mouse = { x: 0, y: 0, isDown: false };
let mode = modes.DOTTED;
let prevDot = null;

// Initialize the decoupled external crop coordinator component
const cropper = new CropManager(canvas, drawingCanvas);

function init() {
  const dpr = window.devicePixelRatio || 1;

  // Size visible canvas
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  // Size backing drawing canvas identically
  drawingCanvas.width = window.innerWidth * dpr;
  drawingCanvas.height = window.innerHeight * dpr;

  width = window.innerWidth;
  height = window.innerHeight;

  // Scale contexts globally for sharp retina screens
  ctx.scale(dpr, dpr);
  dCtx.scale(dpr, dpr);
}

let prevTime = 0;

function update() {}

function draw(ctx) {
  // Clear the active visible application presentation screen viewport frame
  ctx.clearRect(0, 0, width, height);

  // 1. Render the saved artwork layer underneath
  ctx.drawImage(drawingCanvas, 0, 0, width, height);

  // 2. Call the external module to overlay the active selector layout lines
  cropper.draw(ctx);
}

function loop(time) {
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  update();
  draw(ctx);

  requestAnimationFrame(loop);
}

canvas.addEventListener("mousedown", (event) => {
  // Delegate hit testing calculations out to class layer mechanics
  const interceptedByUI = cropper.checkHit(mouse.x, mouse.y);
  
  if (!interceptedByUI) {
    mouse.isDown = true;
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;

  // Update selection box movement coordinates inside module
  if (cropper.isDragging) {
    cropper.handleMove(mouse.x, mouse.y);
    return;
  }

  // Handle User Drawing Input (Renders strictly directly to persistent background canvas)
  if (mouse.isDown) {
    dCtx.fillStyle = "white";
    dCtx.strokeStyle = "white";
    dCtx.lineWidth = 2;

    if (mode == modes.DOTTED) {
      dCtx.beginPath();
      dCtx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2, 0);
      dCtx.fill();
    } else if (mode == modes.LINED) {
      dCtx.beginPath();
      if (prevDot) {
        dCtx.moveTo(prevDot.x, prevDot.y);
        dCtx.lineTo(mouse.x, mouse.y);
        dCtx.stroke();
        prevDot.x = mouse.x;
        prevDot.y = mouse.y;
      } else {
        prevDot = { x: mouse.x, y: mouse.y };
      }
    }
  }
});

canvas.addEventListener("mouseup", () => {
  mouse.isDown = false;
  cropper.stopDragging(); // Clear drag state inside module
  prevDot = null;
});

// UI Mode handling selectors
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

window.addEventListener("resize", init);
init();
loop(performance.now());
