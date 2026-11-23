window.Bullets = {
  list: [],
  
  reset() {
    this.list = [];
  },
  
  create(x, y, speed, friendly, damage, angle = 0) {
    this.list.push({
      x,
      y,
      vx: Math.sin(angle) * Math.abs(speed),
      vy: -Math.cos(angle) * Math.abs(speed),
      radius: friendly ? 4 : 6,
      color: friendly ? '#00ffff' : '#ff4444',
      damage: damage || 1,
      friendly: !!friendly
    });
  },
  
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i];
      b.x += b.vx * dt / 1000;
      b.y += b.vy * dt / 1000;
      if (b.y < -20 || b.y > Game.height + 20 || b.x < -20 || b.x > Game.width + 20) {
        this.list.splice(i, 1);
      }
    }
  },
  
  draw(ctx) {
    this.list.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      if (b.friendly) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
};