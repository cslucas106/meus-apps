class UI {
  constructor(game) {
    this.game = game;
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.scoreVal = document.getElementById('scoreVal');
    this.livesVal = document.getElementById('livesVal');
    this.finalScore = document.getElementById('finalScore');
    
    this.startBtn.addEventListener('click', () => {
      soundManager.init();
      this.startScreen.classList.add('hidden');
      this.game.start();
    });
    this.restartBtn.addEventListener('click', () => {
      soundManager.init();
      this.gameOverScreen.classList.add('hidden');
      this.game.start();
    });
  }
  updateHUD(score, lives) {
    this.scoreVal.textContent = score;
    this.livesVal.textContent = lives;
  }
  showGameOver(score) {
    this.finalScore.textContent = score;
    this.gameOverScreen.classList.remove('hidden');
  }
}