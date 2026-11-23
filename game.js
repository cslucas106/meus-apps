class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.controls = new Controls(this.canvas);
    this.ui = new UI(this);
    
    this.score = 0;
    this.lives = 3;
    this.isRunning = false;
    this.lastTime = 0;
    this.spawnTimer = 0;
    
    this.player = {
      x: 0,
      y: 0,
      radius: 18,
      speed: 0.15,
      shootTimer: 0
    };
    
    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame((t) => this.loop(t));
  }
  resize() {
    const parent = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    if (!this.isRunning) {
      this.player.x = this.width / 2;
      this.player.y = this.height - 80;
    }
  }
  start() {
    this.score = 0;
    this.lives = 3;
    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    this.player.x = this.width / 2;
    this.player.y = this.height - 80;
    this.ui.updateHUD(this.score, this.lives);
    this.isRunning = true;
    this.lastTime = performance.now();
  }
  gameOver() {
    this.isRunning = false;
    soundManager.playExplosion();
    this.ui.showGameOver(this.score);
  }
  spawnAsteroid() {
    const radius = Math.random() * 20 + 15;
    const x = Math.random() * (this.width - radius * 2) + radius;
    const y = -radius;
    const speed = Math.random() * 2 + 1.5;
    this.asteroids.push({ x, y, radius, speed });
  }
  createExplosion(x, y, color = '#0ff') {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }
  update(dt) {
    if (!this.isRunning) return;
    
    if (this.controls.isDown && this.controls.pointerX !== null) {
      const dx = this.controls.pointerX - this.player.x;
      const dy = this.controls.pointerY - this.player.y;
      this.player.x += dx * this.player.speed;
      this.player.y += dy * this.player.speed;
      
      this.player.x = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.y));
    }
    
    this.player.shootTimer += dt;
    if (this.player.shootTimer > 250) {
      this.player.shootTimer = 0;
      this.bullets.push({ x: this.player.x, y: this.player.y - this.player.radius, radius: 4, speed: 8 });
      soundManager.playLaser();
    }
    
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      let b = this.bullets[i];
      b.y -= b.speed;
      if (b.y < -10) {
        this.bullets.splice(i, 1);
      }
    }
    
    this.spawnTimer += dt;
    if (this.spawnTimer > 1000) {
      this.spawnTimer = 0;
      this.spawnAsteroid();
    }
    
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      let a = this.asteroids[i];
      a.y += a.speed;
      
      const dist = Math.hypot(this.player.x - a.x, this.player.y - a.y);
      if (dist < this.player.radius + a.radius) {
        this.asteroids.splice(i, 1);
        this.lives--;
        this.ui.updateHUD(this.score, this.lives);
        soundManager.playHit();
        this.createExplosion(this.player.x, this.player.y, '#f00');
        if (this.lives <= 0) {
          this.gameOver();
        }
        continue;
      }
      
      let bulletHit = false;
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        let b = this.bullets[j];
        if (Math.hypot(b.x - a.x, b.y - a.y) < b.radius + a.radius) {
          bulletHit = true;
          this.bullets.splice(j, 1);
          break;
        }
      }
      
      if (bulletHit) {
        this.createExplosion(a.x, a.y, '#0ff');
        soundManager.playExplosion();
        this.asteroids.splice(i, 1);
        this.score += 10;
        this.ui.updateHUD(this.score, this.lives);
        continue;
      }
      
      if (a.y > this.height + a.radius) {
        this.asteroids.splice(i, 1);
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  draw() {
    this.ctx.fillStyle = '#050510';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#0ff';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ff0';
    for (let b of this.bullets) {
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.fillStyle = '#888';
    for (let a of this.asteroids) {
      this.ctx.beginPath();
      this.ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    for (let p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(dt);
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});