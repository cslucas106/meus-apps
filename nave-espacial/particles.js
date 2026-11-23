window.Particles = {
  list: [],
  
  reset() {
    this.list = [];
  },
  
  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.list.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        life: 500 + Math.random() * 500,
        maxLife: 500 + Math.random() * 500
      });
    }
  },
  
  createHit(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      this.list.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        color: '#ffff00',
        life: 200 + Math.random() * 200,
        maxLife: 200 + Math.random() * 200
      });
    }
  },
  
  createPowerUp(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 80;
      this.list.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3,
        color,
        life: 800,
        maxLife: 800
      });
    }
  },
  
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x += p.vx * dt / 1000;
      p.y += p.vy * dt / 1000;
      p.vy += 20 * dt / 1000;
      p.life -= dt;
      if (p.life <= 0) this.list.splice(i, 1);
    }
  },
  
  draw(ctx) {
    this.list.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
};