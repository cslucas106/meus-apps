document.addEventListener('DOMContentLoaded', () => {
  Game.init();
  Controls.init();

  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const startScreen = document.getElementById('start-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');

  startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    Game.start();
  });

  restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    Game.start();
  });

  let lastTime = 0;
  function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (Game.state === 'PLAYING') {
      Game.update(dt);
      Game.render();
      scoreEl.innerText = `Pontos: ${Game.score}`;
      livesEl.innerText = `Vidas: ${Game.lives}`;
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});