const c = document.getElementById('c'), ctx = c.getContext('2d');
let W = innerWidth, H = innerHeight; c.width = W; c.height = H;
for (let i = 0; i < 80; i++) Stars.push(spawnStar(W, H));

let score = 0, wave = 1, waveT = 0, gameOver = false, shake = 0;
Player.x = W / 2; Player.y = H / 2;

window.addEventListener('resize', () => { W = innerWidth; H = innerHeight; c.width = W; c.height = H; });

c.addEventListener('mousedown', e => {
  if (gameOver) { restart(); return; }
  if (e.clientX > W / 2) { updateMouseStick(e); }
  else { Input.shoot = true; resumeAudio(); }
});
c.addEventListener('mousemove', e => { if (touchJ === -1) updateMouseStick(e); });
c.addEventListener('mouseup', () => { touchJ = null; resetStick(); Input.shoot = false; });
c.addEventListener('click', () => { if (gameOver) restart(); });

let touchJ = null;
function updateMouseStick(e) {
  const r = stickR.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const dx = e.clientX - cx, dy = e.clientY - cy;
  const d = Math.hypot(dx, dy), maxR = 45;
  const a = Math.atan2(dy, dx), cd = Math.min(d, maxR);
  Input.x = Math.cos(a) * cd / maxR; Input.y = Math.sin(a) * cd / maxR;
  if (cd > 15) { Input.aimX = Math.cos(a); Input.aimY = Math.sin(a); }
  knobR.style.transform = `translate(${Math.cos(a) * cd}px, ${Math.sin(a) * cd}px)`;
}
function resetStick() { Input.x = Input.y = 0; knobR.style.transform = 'translate(0,0)'; }

function loop() {
  if (shake > 0) { shake--; ctx.save(); ctx.translate((Math.random() - 0.5) * shake * 2, (Math.random() - 0.5) * shake * 2); }
  ctx.fillStyle = '#0d0d1a'; ctx.fillRect(0, 0, W, H);

  Stars.forEach(s => { ctx.fillStyle = `rgba(255,255,255,${s.o})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill(); s.y += s.spd; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });

  if (!gameOver) {
    Player.x = clamp(Player.x + Input.x * Player.spd, Player.r, W - Player.r);
    Player.y = clamp(Player.y + Input.y * Player.spd, Player.r, H - Player.r);
    if (Player.inv > 0) Player.inv--;
    if (Player.cd > 0) Player.cd--;
    if (Input.shoot) shoot();

    waveT++; if (waveT > 1800) { wave++; waveT = 0; }
    if (Enemies.length < 3 + wave * 0.8 && Math.random() < 0.02) spawnEnemy(W, H);

    Bullets.forEach(b => { b.trail.unshift({ x: b.x, y: b.y }); if (b.trail.length > 8) b.trail.pop(); b.x += Math.cos(b.a) * b.spd; b.y += Math.sin(b.a) * b.spd; });
    for (let i = Bullets.length - 1; i >= 0; i--) if (Bullets[i].x < -20 || Bullets[i].x > W + 20 || Bullets[i].y < -20 || Bullets[i].y > H + 20) Bullets.splice(i, 1);

    Enemies.forEach(e => {
      const a = angle(e.x, e.y, Player.x, Player.y); e.x += Math.cos(a) * e.spd; e.y += Math.sin(a) * e.spd; e.ang = a;
      Bullets.forEach(b => { if (dist(e.x, e.y, b.x, b.y) < e.sz + b.sz) { e.hp -= b.dmg; addParts(b.x, b.y, e.col, 3); SFX.hit(); Bullets.splice(Bullets.indexOf(b), 1); if (e.hp <= 0) { score += e.val; SFX.kill(); addParts(e.x, e.y, e.col, 12); spawnPickup(e.x, e.y); Enemies.splice(Enemies.indexOf(e), 1); } } });
      if (dist(e.x, e.y, Player.x, Player.y) < e.sz + Player.r && Player.inv === 0) { Player.hp--; Player.inv = 60; shake = 12; SFX.hurt(); addParts(Player.x, Player.y, '#ff6b6b', 8); if (Player.hp <= 0) gameOver = true; }
    });
    for (let i = Enemies.length - 1; i >= 0; i--) if (Enemies[i].hp <= 0) Enemies.splice(i, 1);

    Pickups.forEach(p => { p.t += 0.1; p.y += Math.sin(p.t) * 0.5; if (dist(p.x, p.y, Player.x, Player.y) < Player.r + 15) { if (p.type === 'hp' && Player.hp < Player.maxHp) { Player.hp = Math.min(Player.maxHp, Player.hp + 1); SFX.power(); } else if (p.type === 'pow' && Player.power < 3) { Player.power++; Player.cd = 0; SFX.power(); } Pickups.splice(Pickups.indexOf(p), 1); } });
    for (let i = Pickups.length - 1; i >= 0; i--) if (Pickups[i].t > 600) Pickups.splice(i, 1);

    Parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; p.life -= 0.02; });
    for (let i = Parts.length - 1; i >= 0; i--) if (Parts[i].life <= 0) Parts.splice(i, 1);

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPickups();
    drawParts();
    drawUI();
  } else {
    drawGameOver();
  }
  if (shake > 0) ctx.restore();
  requestAnimationFrame(loop);
}

function drawPlayer() {
  ctx.save(); ctx.translate(Player.x, Player.y);
  if (Player.inv > 0 && Math.floor(Player.inv / 4) % 2) ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -Player.r * 1.2); ctx.lineTo(Player.r * 0.7, 0); ctx.lineTo(0, Player.r * 0.6); ctx.lineTo(-Player.r * 0.7, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = Player.inv > 0 ? '#ff6b9d' : '#4ecdc4'; ctx.beginPath(); ctx.arc(0, 0, Player.r * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawBullets() {
  Bullets.forEach(b => { b.trail.forEach((t, i) => { ctx.globalAlpha = (i + 1) / b.trail.length * 0.4; ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(t.x, t.y, b.sz * (i + 1) / b.trail.length, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1; ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(b.x, b.y, b.sz, 0, Math.PI * 2); ctx.fill(); });
}
function drawEnemies() {
  Enemies.forEach(e => { ctx.fillStyle = e.col; ctx.beginPath();
    if (e.type === 0) ctx.arc(e.x, e.y, e.sz, 0, Math.PI * 2);
    else if (e.type === 1) { ctx.moveTo(e.x + e.sz * Math.cos(e.ang), e.y + e.sz * Math.sin(e.ang)); ctx.lineTo(e.x + e.sz * 0.5 * Math.cos(e.ang + 2.5), e.y + e.sz * 0.5 * Math.sin(e.ang + 2.5)); ctx.lineTo(e.x - e.sz * 0.8 * Math.cos(e.ang), e.y - e.sz * 0.8 * Math.sin(e.ang)); ctx.lineTo(e.x + e.sz * 0.5 * Math.cos(e.ang - 2.5), e.y + e.sz * 0.5 * Math.sin(e.ang - 2.5)); }
    else { const s = 5; for (let i = 0; i < s; i++) { const a = e.ang + i * Math.PI * 2 / s; ctx.lineTo(e.x + e.sz * Math.cos(a), e.y + e.sz * Math.sin(a)); } }
    ctx.closePath(); ctx.fill();
    if (e.hp < e.maxHp) { ctx.fillStyle = '#000'; ctx.fillRect(e.x - e.sz, e.y - e.sz - 6, e.sz * 2, 4); ctx.fillStyle = '#ff6b6b'; ctx.fillRect(e.x - e.sz, e.y - e.sz - 6, e.sz * 2 * e.hp / e.maxHp, 4); } });
}
function drawPickups() {
  Pickups.forEach(p => { ctx.fillStyle = p.type === 'hp' ? '#ff6b6b' : '#ffd93d'; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.t); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, 4); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff3'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
}
function drawParts() { Parts.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1; }
function drawUI() {
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px system-ui'; ctx.fillText('Score: ' + score, 20, 30); ctx.fillText('Wave: ' + wave, 20, 55);
  for (let i = 0; i < Player.maxHp; i++) { ctx.fillStyle = i < Player.hp ? '#ff6b6b' : '#333'; ctx.beginPath(); ctx.arc(W - 30 - i * 22, 30, 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = Player.power === 1 ? '#fff' : Player.power === 2 ? '#ffd93d' : '#ff6b9d'; ctx.font = '16px system-ui'; ctx.fillText(['NORMAL', 'SPREAD', 'CHAOS'][Player.power - 1], W - 120, 55);
}
function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ff6b9d'; ctx.font = 'bold 48px system-ui'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
  ctx.fillStyle = '#fff'; ctx.font = '24px system-ui'; ctx.fillText('Score: ' + score, W / 2, H / 2 + 10);
  ctx.fillStyle = '#ffd93d'; ctx.font = '18px system-ui'; ctx.fillText('Toque ou Espaço para reiniciar', W / 2, H / 2 + 50); ctx.textAlign = 'left';
}
function restart() {
  Player.x = W / 2; Player.y = H / 2; Player.hp = 5; Player.power = 1; Player.inv = 0; Player.cd = 0;
  Input.aimX = 0; Input.aimY = -1; Bullets.length = 0; Enemies.length = 0; Parts.length = 0; Pickups.length = 0;
  score = 0; wave = 1; waveT = 0; gameOver = false; shake = 0; resumeAudio();
}
loop();