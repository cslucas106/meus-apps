window.Player = {
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  radius: 18,
  speed: 300,
  fireRate: 150,
  fireTimer: 0,
  shield: 0,
  powerLevel: 1,
  powerTimer: 0,
  color: '#00ffff',
  engineGlow: 0,
  
  resize(w, h) {
    this.x = w / 2;
    this.y = h - 60;
  },
  
  reset(w, h) {
    this.resize(w, h);
    this.fireRate = 150;
    this.fireTimer = 0;
    this.shield = 0;
    this.powerLevel = 1;
    this.powerTimer = 0;
    this.engineGlow = 0;
  },
  
  update(dt, game) {
    const input = Controls;
    
    if (input.left) this.x -= this.speed * dt / 1000;
    if (input.right) this.x += this.speed * dt / 1000;
    if (input.up) this.y -= this.speed * dt / 1000;
    if (input.down) this.y += this.speed * dt / 1000;
    
    const margin = this.radius;
    this.x = Math.max(margin, Math.min(game.width - margin, this.x));
    this.y = Math.max(margin, Math.min(game.height - margin, this.y));
    
    this.engineGlow = (input.up || input.down) ? 1 : 0.3;
    
    if (this.shield > 0) this.shield -= dt;
    if (this.powerTimer > 0) {
      this.powerTimer -= dt;
      if (this.powerTimer <= 0) this.powerLevel = 1;
    }
    
    this.fireTimer += dt;
    if (input.fire && this.fireTimer >= this.fireRate) {
      this.shoot();
      this.fireTimer = 0;
    }
  },
  
  shoot() {
    const spread = this.powerLevel > 1 ? 0.3 : 0;
    const count = this.powerLevel;
    for (let i = 0; i < count; i++) {
      const angle = (i - (count - 1) / 2) * spread;
      Bullets.create(this.x, this.y - this.radius, -600, true, 1, angle);
    }
  },
  
  addPower() {
    this.powerLevel = Math.min(3, this.powerLevel + 1);
    this.powerTimer = 10000;
  },
  
  addShield() {
    this.shield = 5000;
  },
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (this.engineGlow > 0.5) {
      const grad = ctx.createRadialGradient(0, this.radius, 0, 0, this.radius, this.radius * 2);
      grad.addColorStop(0, '#00ffff');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, this.radius + 8, 12, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (this.shield > 0) {
      ctx.strokeStyle = '#00ffff';
      ctx.globalAlpha = 0.3 + 0.3 * Math.sin(Date.now() / 100);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius * 0.7, this.radius * 0.5);
    ctx.lineTo(0, this.radius * 0.2);
    ctx.lineTo(-this.radius * 0.7, this.radius * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -this.radius * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
};