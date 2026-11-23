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
    
    this.restartBtn.addEventListener('click', () => Game.start());
    this.restartBtn.addEventListener('touchstart', e => { e.preventDefault(); Game.start(); }, { passive: false });
  },
  
  update(game) {
    this.scoreEl.textContent = game.score;
    this.highScoreEl.textContent = game.highScore;
    this.livesEl.textContent = '♥'.repeat(game.lives);
    this.levelEl.textContent = game.level;
  },
  
  showGameOver(game) {
    this.finalScoreEl.textContent = game.score;
    this.overlayEl.classList.remove('hidden');
  },
  
  hideOverlay() {
    this.overlayEl.classList.add('hidden');
  }
};