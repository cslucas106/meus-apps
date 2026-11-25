const Controles = {
  clicado: false,
  init(canvas, callback) {
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.clicado = true;
      if (callback) callback();
    });
    
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.clicado = true;
        if (callback) callback();
      }
    });
  },
  consumirClique() {
    if (this.clicado) {
      this.clicado = false;
      return true;
    }
    return false;
  }
};