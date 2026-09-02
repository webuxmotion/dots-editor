export default class ColorPicker {
  constructor(selector) {
    this._init(selector);
  }

  _init(selector) {
    const colorPicker = document.querySelector(selector);
    colorPicker.addEventListener("input", updateFirst);

    const colorFromStorage = localStorage.getItem('background');
    if (colorFromStorage) {
      colorPicker.value = colorFromStorage;
      canvas.style.backgroundColor = colorFromStorage;
    }

    function updateFirst(event) {
      const canvas = document.querySelector("canvas");
      const color = event.target.value;
      if (canvas) {
        localStorage.setItem('background', color);
        canvas.style.backgroundColor = color;
      }
    }
  }
}
