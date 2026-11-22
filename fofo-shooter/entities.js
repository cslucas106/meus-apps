window.Player = { x: 0, y: 0, r: 14, spd: 4, hp: 5, maxHp: 5, inv: 0, power: 1, cd: 0 };
window.Bullets = [];
window.Enemies = [];
window.Parts = [];
window.Pickups = [];
window.Stars = [];

window.spawnStar = (W, H) => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + 0.3, spd: Math.random() * 0.5 + 0.2, o: Math.random() });

window.spawnEnemy = (W, H) => {
  const side = Math.floor(Math.random() * 4), m = 50;
  let x, y;
  if (side === 0) { x = Math.random() * W; y = -m; }
  else if (side === 1) { x = W + m; y = Math.random() * H; }
  else if (side === 2) { x = Math.random() * W; y = H + m; }
  else { x = -m; y = Math.random() * H; }
  const t = Math.random() < 0.3 ? 1 : Math.random() < 0.6 ? 2 : 0;
  const hp = t === 0 ? 1 : t === 1 ? 3 : 5;
  const spd = t === 0 ? 1.8 : t === 1 ? 1.2 : 0.7;
  const sz = t === 0 ? 12 : t === 1 ? 18 : 26;
  const col = t === 0 ? '#ff6b6b' : t === 1 ? '#ffd93d' : '#c44569';
  const val = t === 0 ? 10 : t === 1 ? 25 : 50;
  Enemies.push({ x, y, hp, maxHp: hp, spd, sz, col, val, type: t, ang: 0 });
};

window.spawnPickup = (x, y) => {
  if (Math.random() < 0.15) Pickups.push({ x, y, type: Math.random() < 0.5 ? 'hp' : 'pow', t: 0 });
};

window.shoot = () => {
  if (Player.cd > 0) return;
  Player.cd = Player.power >= 3 ? 60 : Player.power === 2 ? 90 : 130;
  SFX.shoot();
  const a = Math.atan2(Input.aimY, Input.aimX) || 0;
  if (Player.power === 1) {
    Bullets.push({ x: Player.x, y: Player.y, a, spd: 12, dmg: 1, sz: 5, col: '#fff', trail: [] });
  } else if (Player.power === 2) {
    [-0.15, 0, 0.15].forEach(o => Bullets.push({ x: Player.x, y: Player.y, a: a + o, spd: 11, dmg: 1, sz: 4, col: '#ffd93d', trail: [] }));
  } else {
    [-0.25, -0.1, 0, 0.1, 0.25].forEach(o => Bullets.push({ x: Player.x, y: Player.y, a: a + o, spd: 10, dmg: 1, sz: 4, col: '#ff6b9d', trail: [] }));
    [-0.5, 0.5].forEach(o => Bullets.push({ x: Player.x, y: Player.y, a: a + o, spd: 9, dmg: 1, sz: 3, col: '#fff', trail: [] }));
  }
};

window.addParts = (x, y, col, n) => {
  for (let i = 0; i < n; i++) Parts.push({ x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 1, col, sz: Math.random() * 3 + 1 });
};

window.angle = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);