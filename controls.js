class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.pointerX = null;
    this.pointerY = null;
    this.isDown = false;
    this.setupListeners();
  }
  setupListeners() {
    const handleMove = (x, y) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerX = x - rect.left;
      this.pointerY = y - rect.top;
    };
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDown = true;
      handleMove(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (this.isDown) {
        handleMove(e.clientX, e.clientY);
      }
    });
    window.addEventListener('pointerup', () => {
      this.isDown = false;
      this.pointerX = null;
      this.pointerY = null;
    });
  }
}