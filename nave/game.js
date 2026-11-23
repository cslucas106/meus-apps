// Lógica principal do jogo de nave
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const container = document.getElementById('game-container');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = container.clientWidth * dpr;
  canvas.height = container.clientHeight * dpr;
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const gameState = {
  score: 0,
  lives: 3,
  isPlaying: false
};

const player = {
  x: canvas.width / 2 / (window.devicePixelRatio || 1),
  y: canvas.height / (window.devicePixelRatio || 1) - 80,
  width: 40,
  height: 40,
  speed: 5,
  dx: 0,
  cooldown: 0
};

let bullets = [];
let enemies = [];
let particles = [];

function spawnEnemy() {
  if (!gameState.isPlaying) return;
  const width = 35;
  const height = 35;
  const x = Math.random() * ((canvas.width / (window.devicePixelRatio || 1)) - width);
  enemies.push({
    x: x,
    y: -height,
    width: width,
    height: height,
    speed: 2 + Math.random() * 2
  });
}

setInterval(spawnEnemy, 1200);

function createExplosion(x, y) {
  sounds.playExplosion();
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      radius: Math.random() * 3 + 1,
      alpha: 1
    });
  }
}

function shoot() {
  if (!gameState.isPlaying) return;
  if (player.cooldown <= 0) {
    bullets.push({
      x: player.x + player.width / 2 - 3,
      y: player.y,
      width: 6,
      height: 12,
      speed: 8
    });
    player.cooldown = 12;
    sounds.playShoot();
  }
}

function update() {
  if (!gameState.isPlaying) return;

  if (player.cooldown > 0) player.cooldown--;

  player.x += player.dx;
  const maxX = (canvas.width / (window.devicePixelRatio || 1)) - player.width;
  if (player.x < 0) player.x = 0;
  if (player.x > maxX) player.x = maxX;

  // Tiros
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -20) {
      bullets.splice(i, 1);
    }
  }

  // Inimigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;
    
    // Colisão com jogador
    if (
      player.x < enemies[i].x + enemies[i].width &&
      player.x + player.width > enemies[i].x &&
      player.y < enemies[i].y + enemies[i].height &&
      player.y + player.height > enemies[i].y
    ) {
      createExplosion(enemies[i].x, enemies[i].y);
      enemies.splice(i, 1);
      gameState.lives--;
      sounds.playHit();
      updateHUD();
      if (gameState.lives <= 0) {
        gameOver();
      }
      continue;
    }

    // Colisão tiro com inimigo
    let enemyHit = false;
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (
        bullets[j].x < enemies[i].x + enemies[i].width &&
        bullets[j].x + bullets[j].width > enemies[i].x &&
        bullets[j].y < enemies[i].y + enemies[i].height &&
        bullets[j].y + bullets[j].height > enemies[i].y
      ) {
        createExplosion(enemies[i].x, enemies[i].y);
        bullets.splice(j, 1);
        enemyHit = true;
        gameState.score += 100;
        updateHUD();
        break;
      }
    }

    if (enemyHit) {
      enemies.splice(i, 1);
      continue;
    }

    // Passou da tela
    if (enemies[i].y > (canvas.height / (window.devicePixelRatio || 1))) {
      enemies.splice(i, 1);
    }
  }

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].x += particles[i].dx;
    particles[i].y += particles[i].dy;
    particles[i].alpha -= 0.03;
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function draw() {
  const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
  const logicalHeight = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  // Jogador
  ctx.fillStyle = '#58a6ff';
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Tiros
  ctx.fillStyle = '#ff7b72';
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Inimigos
  ctx.fillStyle = '#f85149';
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // Partículas
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = '#ffa657';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);