window.Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  running: false,
  lastTime: 0,
  score: 0,
  highScore: 0,
  lives: 3,
  level: 1,
  spawnTimer: 0,
  spawnInterval: 1500,
  shakeTime: 0,
  animationFrameId: null,
  
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.highScore = parseInt(localStorage.getItem('naveHighScore') || '0');
    window.addEventListener('resize', () => this.resize());
  },
  
  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);
    Player.resize(this.width, this.height);
  },
  
  start() {
    this.stop();
    UI.hideOverlay();
    this.running = true;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 1500;
    this.shakeTime = 0;
    Player.reset(this.width, this.height);
    Enemies.reset();
    Bullets.reset();
    Particles.reset();
    PowerUps.reset();
    UI.update(this);
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(t => this.loop(t));
  },
  
  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  },
  
  loop(time) {
    if (!this.running) return;
    const dt = time - this.lastTime;
    this.lastTime = time;
    
    this.update(dt);
    this.draw();
    
    this.animationFrameId = requestAnimationFrame(t => this.loop(t));
  },
  
  update(dt) {
    if (this.shakeTime > 0) this.shakeTime -= dt;
    
    Player.update(dt, this);
    Enemies.update(dt, this);
    Bullets.update(dt);
    Particles.update(dt);
    PowerUps.update(dt);
    
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      Enemies.spawn(this.width, this.level);
      this.spawnTimer = 0;
      this.spawnInterval = Math.max(600, 1500 - this.level * 50);
    }
    
    this.checkCollisions();
    UI.update(this);
  },
  
  checkCollisions() {
    const player = Player;
    
    for (let bi = Bullets.list.length - 1; bi >= 0; bi--) {
      const bullet = Bullets.list[bi];
      if (!bullet.friendly) continue;
      for (let ei = Enemies.list.length - 1; ei >= 0; ei--) {
        const enemy = Enemies.list[ei];
        if (this.collide(bullet, enemy)) {
          enemy.hp -= bullet.damage;
          Bullets.list.splice(bi, 1);
          if (enemy.hp <= 0) {
            this.addScore(enemy.points);
            Particles.createExplosion(enemy.x, enemy.y, enemy.color);
            PowerUps.spawn(enemy.x, enemy.y);
            Enemies.list.splice(ei, 1);
          } else {
            Particles.createHit(enemy.x, enemy.y);
          }
          break;
        }
      }
    }
    
    if (player.shield <= 0) {
      for (let ei = Enemies.list.length - 1; ei >= 0; ei--) {
        if (this.collide(player, Enemies.list[ei])) {
          this.loseLife();
          Particles.createExplosion(Enemies.list[ei].x, Enemies.list[ei].y, Enemies.list[ei].color);
          Enemies.list.splice(ei, 1);
        }
      }
    }
    
    for (let bi = Enemies.bullets.length - 1; bi >= 0; bi--) {
      if (player.shield <= 0 && this.collide(player, Enemies.bullets[bi])) {
        this.loseLife();
        Particles.createExplosion(player.x, player.y, '#00ffff');
        Enemies.bullets.splice(bi, 1);
      }
    }
    
    for (let i = PowerUps.list.length - 1; i >= 0; i--) {
      if (this.collide(player, PowerUps.list[i])) {
        PowerUps.list[i].apply();
        Particles.createPowerUp(PowerUps.list[i].x, PowerUps.list[i].y, PowerUps.list[i].color);
        PowerUps.list.splice(i, 1);
      }
    }
  },
  
  collide(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.radius + b.radius);
  },
  
  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('naveHighScore', this.highScore);
    }
    if (this.score > this.level * 1000) this.level++;
  },
  
  loseLife() {
    this.lives--;
    this.shakeTime = 300;
    Player.shield = 60;
    if (this.lives <= 0) this.gameOver();
  },
  
  gameOver() {
    this.stop();
    UI.showGameOver(this);
  },
  
  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.save();
    if (this.shakeTime > 0) {
      const intensity = this.shakeTime / 300 * 4;
      ctx.translate(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity
      );
    }
    
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);
    
    this.drawStars();
    Particles.draw(ctx);
    Enemies.draw(ctx);
    Bullets.draw(ctx);
    PowerUps.draw(ctx);
    Player.draw(ctx);
    
    ctx.restore();
  },
  
  stars: [],
  drawStars() {
    if (this.stars.length === 0) {
      for (let i = 0; i < 80; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          speed: 0.2 + Math.random() * 0.5,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random()
        });
      }
    }
    const ctx = this.ctx;
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.height) s.y = 0;
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#fff';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1;
  }
};