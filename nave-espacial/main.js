document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  Game.init(canvas);
  Controls.init();
  UI.init();
  Game.start();
});