const Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  score: 0,
  lives: 3,
  state: 'START', // START, PLAYING, GAMEOVER
  ship: { x: 0, y: 0, width: 40, height: 40, speed: 5, targetX: 0 },
  bullets: [],
  enemies: [],
  stars: [],
  particleList: [],
  lastEnemySpawn: 0,
  enemySpawnInterval: 1500,
  
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5
      });
    }
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    if (this.ship.y === 0) {
      this.ship.x = this.width / 2;
      this.ship.targetX = this.width / 2;
      this.ship.y = this.height - 80;
    }
  },

  start() {
    this.score = 0;
    this.lives = 3;
    this.bullets = [];
    this.enemies = [];
    this.particleList = [];
    this.state = 'PLAYING';
    this.ship.x = this.width / 2;
    this.ship.targetX = this.width / 2;
    this.ship.y = this.height - 80;
    this.lastEnemySpawn = Date.now();
  },

  update(dt) {
    if (this.state !== 'PLAYING') return;

    // Movimento suave da nave em direção ao toque/mouse
    const dx = this.ship.targetX - this.ship.x;
    this.ship.x += dx * 0.2;

    // Limites da tela
    if (this.ship.x < this.ship.width / 2) this.ship.x = this.ship.width / 2;
    if (this.ship.x > this.width - this.ship.width / 2) this.ship.x = this.width - this.ship.width / 2;

    // Atualizar estrelas
    for (let star of this.stars) {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    // Gerar tiros automáticos
    if (!this.lastShot || Date.now() - this.lastShot > 250) {
      this.bullets.push({ x: this.ship.x, y: this.ship.y - 20, width: 4, height: 12, speed: 10 });
      this.lastShot = Date.now();
    }

    // Atualizar tiros
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let b = this.bullets[i];
      b.y -= b.speed;
      if (b.y < 0) {
        this.bullets.splice(i, 1);
      }
    }

    // Gerar inimigos
    if (Date.now() - this.lastEnemySpawn > this.enemySpawnInterval) {
      const size = 35;
      const ex = Math.random() * (this.width - size) + size / 2;
      this.enemies.push({ x: ex, y: -size, width: size, height: size, speed: Math.random() * 2 + 2, hp: 1 });
      this.lastEnemySpawn = Date.now();
    }

    // Atualizar inimigos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let e = this.enemies[i];
      e.y += e.speed;

      // Colisão com nave
      if (Math.abs(e.x - this.ship.x) < (e.width + this.ship.width) / 3 &&
          Math.abs(e.y - this.ship.y) < (e.height + this.ship.height) / 3) {
        this.enemies.splice(i, 1);
        this.lives--;
        this.createExplosion(this.ship.x, this.ship.y, '#00ffff');
        if (this.lives <= 0) {
          this.state = 'GAMEOVER';
          document.getElementById('final-score').innerText = `Pontuação: ${this.score}`;
          document.getElementById('game-over-screen').classList.remove('hidden');
        }
        continue;
      }

      // Colisão com tiros
      let destroyed = false;
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        let b = this.bullets[j];
        if (Math.abs(e.x - b.x) < e.width / 2 && Math.abs(e.y - b.y) < e.height / 2) {
          this.bullets.splice(j, 1);
          destroyed = true;
          break;
        }
      }

      if (destroyed) {
        this.createExplosion(e.x, e.y, '#ff0055');
        this.enemies.splice(i, 1);
        this.score += 100;
        continue;
      }

      // Remover se passou da tela
      if (e.y > this.height + e.height) {
        this.enemies.splice(i, 1);
      }
    }

    // Atualizar partículas
    for (let i = this.particleList.length - 1; i >= 0; i--) {
      let p = this.particleList[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        this.particleList.splice(i, 1);
      }
    }
  },

  createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particleList.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: color,
        size: Math.random() * 3 + 1
      });
    }
  },

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Estrelas
    this.ctx.fillStyle = '#ffffff';
    for (let star of this.stars) {
      this.ctx.globalAlpha = star.size / 3;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    this.ctx.globalAlpha = 1;

    // Partículas
    for (let p of this.particleList) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
      this.ctx.restore();
    }

    // Tiros
    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ffff';
    for (let b of this.bullets) {
      this.ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
    }

    // Inimigos (Asteróides)
    this.ctx.fillStyle = '#ff3366';
    this.ctx.shadowColor = '#ff0055';
    for (let e of this.enemies) {
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.width / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Nave
    if (this.state === 'PLAYING') {
      this.ctx.fillStyle = '#00ffff';
      this.ctx.shadowColor = '#00ffff';
      this.ctx.beginPath();
      this.ctx.moveTo(this.ship.x, this.ship.y - this.ship.height / 2);
      this.ctx.lineTo(this.ship.x - this.ship.width / 2, this.ship.y + this.ship.height / 2);
      this.ctx.lineTo(this.ship.x, this.ship.y + this.ship.height / 4);
      this.ctx.lineTo(this.ship.x + this.ship.width / 2, this.ship.y + this.ship.height / 2);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.shadowBlur = 0;
  }
};