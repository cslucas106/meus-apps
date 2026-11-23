window.PowerUps = {
  list: [],
  types: [
    { name: 'power', color: '#00ffff', symbol: 'P', apply: () => Player.addPower() },
    { name: 'shield', color: '#00ff88', symbol: 'S', apply: () => Player.addShield() },
    { name: 'life', color: '#ff4444', symbol: '♥', apply: () => { if (Game.lives < 5) Game.lives++; } },
    { name: 'bomb', color: '#ffaa00', symbol: 'B', apply: () => { Enemies.list.forEach(e => { Game.addScore(e.points); Particles.createExplosion(e.x, e.y, e.color); }); Enemies.list = []; } }
  ],
  
  reset() {
    this.list = [];
  },
  
  spawn(x, y) {
    if (Math.random() < 0.15) {
      const type = this.types[Math.floor(Math.random() * this.types.length)];
      this.list.push({
        x, y,
        vy: 50,
        radius: 16,
        color: type.color,
        symbol: type.symbol,
        apply: type.apply,
        rotation: 0
      });
    }
  },
  
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.y += p.vy * dt / 1000;
      p.rotation += dt / 500;
      if (p.y > Game.height + p.radius) this.list.splice(i, 1);
    }
  },
  
  draw(ctx) {
    this.list.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, 0, 1);
      
      ctx.restore();
    });
  }
};