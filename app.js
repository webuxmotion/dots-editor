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
function draw() {}
function loop(time) {
  const delta = (time - prevTime) / 1000;

  update();
  draw();

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

window.addEventListener("resize", init);
init();
loop(performance.now());
