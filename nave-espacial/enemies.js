window.Enemies = {
  list: [],
  bullets: [],
  types: [
    { name: 'drone', hp: 1, speed: 80, radius: 14, points: 100, color: '#ff4444', shootChance: 0.001, fireRate: 2000 },
    { name: 'fighter', hp: 2, speed: 100, radius: 18, points: 200, color: '#ffaa00', shootChance: 0.002, fireRate: 1500 },
    { name: 'cruiser', hp: 5, speed: 50, radius: 28, points: 500, color: '#ff00aa', shootChance: 0.003, fireRate: 1000 },
    { name: 'boss', hp: 20, speed: 30, radius: 45, points: 2000, color: '#aa00ff', shootChance: 0.005, fireRate: 800 }
  ],
  
  reset() {
    this.list = [];
    this.bullets = [];
  },
  
  spawn(width, level) {
    const typeIdx = Math.min(this.types.length - 1, Math.floor(level / 2) + Math.floor(Math.random() * 2));
    const type = this.types[typeIdx];
    const x = type.radius + Math.random() * (width - type.radius * 2);
    
    this.list.push({
      x,
      y: -type.radius,
      vx: (Math.random() - 0.5) * 40,
      vy: type.speed,
      hp: type.hp,
      maxHp: type.hp,
      radius: type.radius,
      points: type.points,
      color: type.color,
      shootChance: type.shootChance,
      fireRate: type.fireRate,
      fireTimer: Math.random() * type.fireRate,
      type: type.name,
      angle: 0
    });
  },
  
  update(dt, game) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      e.x += e.vx * dt / 1000;
      e.y += e.vy * dt / 1000;
      e.fireTimer += dt;
      
      if (e.x < e.radius || e.x > game.width - e.radius) e.vx *= -1;
      
      if (e.y > game.height + e.radius) {
        this.list.splice(i, 1);
        continue;
      }
      
      if (e.fireTimer >= e.fireRate && Math.random() < e.shootChance * 60) {
        this.enemyShoot(e, game);
        e.fireTimer = 0;
      }
    }
    
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt / 1000;
      b.y += b.vy * dt / 1000;
      if (b.y > game.height + 20 || b.y < -20 || b.x < -20 || b.x > game.width + 20) {
        this.bullets.splice(i, 1);
      }
    }
  },
  
  enemyShoot(enemy, game) {
    const dx = Player.x - enemy.x;
    const dy = Player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 300;
    this.bullets.push({
      x: enemy.x,
      y: enemy.y + enemy.radius,
      vx: dx / dist * speed,
      vy: dy / dist * speed,
      radius: 6,
      color: enemy.color,
      damage: 1
    });
    
    if (enemy.type === 'boss' || enemy.type === 'cruiser') {
      for (let a = -0.3; a <= 0.3; a += 0.3) {
        if (a === 0) continue;
        const vx = dx / dist * speed * Math.cos(a) - dy / dist * speed * Math.sin(a);
        const vy = dx / dist * speed * Math.sin(a) + dy / dist * speed * Math.cos(a);
        this.bullets.push({
          x: enemy.x,
          y: enemy.y + enemy.radius,
          vx, vy,
          radius: 5,
          color: enemy.color,
          damage: 1
        });
      }
    }
  },
  
  draw(ctx) {
    this.list.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);
      
      if (e.type === 'drone') {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.moveTo(0, -e.radius);
        ctx.lineTo(e.radius, 0);
        ctx.lineTo(0, e.radius);
        ctx.lineTo(-e.radius, 0);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === 'fighter') {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.moveTo(0, -e.radius);
        ctx.lineTo(e.radius * 0.8, e.radius * 0.3);
        ctx.lineTo(e.radius * 0.5, e.radius);
        ctx.lineTo(-e.radius * 0.5, e.radius);
        ctx.lineTo(-e.radius * 0.8, e.radius * 0.3);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === 'cruiser') {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius, e.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-e.radius * 0.3, -e.radius * 0.1, 4, 0, Math.PI * 2);
        ctx.arc(e.radius * 0.3, -e.radius * 0.1, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'boss') {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, e.radius);
        grad.addColorStop(0, e.color);
        grad.addColorStop(1, '#440066');
        ctx.fillStyle = grad;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? e.radius : e.radius * 0.6;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      if (e.hp < e.maxHp) {
        ctx.fillStyle = '#333';
        ctx.fillRect(-e.radius, -e.radius - 10, e.radius * 2, 4);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(-e.radius, -e.radius - 10, e.radius * 2 * (e.hp / e.maxHp), 4);
      }
      
      ctx.restore();
    });
    
    this.bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};