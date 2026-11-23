window.UI = {
  scoreEl: null,
  highScoreEl: null,
  livesEl: null,
  levelEl: null,
  overlayEl: null,
  finalScoreEl: null,
  restartBtn: null,
  
  init() {
    this.scoreEl = document.getElementById('score-value');
    this.highScoreEl = document.getElementById('high-score-value');
    this.livesEl = document.getElementById('lives-value');
    this.levelEl = document.getElementById('level-value');
    this.overlayEl = document.getElementById('overlay');
    this.finalScoreEl = document.getElementById('final-score-value');
    this.restartBtn = document.getElementById('restart-btn');
    
    if (this.restartBtn) {
      const handler = (e) => {
        e.preventDefault();
        Game.start();
      };
      this.restartBtn.addEventListener('click', handler);
      this.restartBtn.addEventListener('touchstart', handler, { passive: false });
    }
  },
  
  update(game) {
    if (this.scoreEl) this.scoreEl.textContent = game.score;
    if (this.highScoreEl) this.highScoreEl.textContent = game.highScore;
    if (this.livesEl) this.livesEl.textContent = '♥'.repeat(game.lives);
    if (this.levelEl) this.levelEl.textContent = game.level;
  },
  
  showGameOver(game) {
    if (this.finalScoreEl) this.finalScoreEl.textContent = game.score;
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');
  },
  
  hideOverlay() {
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
  }
};