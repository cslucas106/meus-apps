const Controls = {
  init() {
    const canvas = document.getElementById('gameCanvas');

    const updatePosition = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      Game.ship.targetX = x;
    };

    canvas.addEventListener('mousemove', (e) => {
      updatePosition(e.clientX);
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updatePosition(e.touches[0].clientX);
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        updatePosition(e.touches[0].clientX);
      }
      e.preventDefault();
    }, { passive: false });
  }
};