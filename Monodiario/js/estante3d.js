// Estante 3D (Three.js r128): livros em pé, de frente, como numa biblioteca.
// Cada cenário ("casa") muda parede, madeira e luz. Só usa a foto da capa e o nome (nunca o conteúdo do diário).
const T = window.THREE;

const POR_FILA = 3, ALT = 1.25, PASSO = 1.78, LARG = 3.6, TAB = 0.14, PROF = 0.7, CEL = 1.12;
const rnd = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }; // sorteio fixo (a estante não muda a cada abertura)

const METAIS = {
  ouro: ['#f6dd9e', '#c9a24e', '#f0d58a'], prata: ['#ffffff', '#aab0b8', '#eef1f5'],
  bronze: ['#e0b080', '#9c6a38', '#d6a572'], cobre: ['#f0a47e', '#b4562f', '#e8946c'],
};
const EMBLEMA = { luas: '☾', arvore: '❦', solua: '☼', mandala: '❂', flor: '⚜', bussola: '✥', brasao: '❖', coroa: '♛' };

// Para criar outro cenário, basta copiar um bloco abaixo (e, se quiser, um desenho novo de parede em parede()).
export const CENARIOS = [
  { id: 'classico', nome: 'Biblioteca', fundo: '#1c120b', madeira: '#5a3a22', rotulo: '#f1e7d6', tint: 0xffffff,
    hemi: [0xffe9c8, 0x2a1a0e, 0.55], dir: [0xffd9a0, 1.0], lampada: null },
  { id: 'sala', nome: 'Sala clara', fundo: '#e9dcc6', madeira: '#b08457', rotulo: '#3a2a1a', tint: 0xffffff,
    hemi: [0xffffff, 0xd8c8b0, 0.62], dir: [0xfff4e0, 0.6], lampada: null },
  { id: 'noite', nome: 'Noite', fundo: '#0c1128', madeira: '#4a3426', rotulo: '#f1e7d6', tint: 0xd5dcff,
    hemi: [0x9fb0ff, 0x10142a, 0.5], dir: [0x8aa0ff, 0.45], lampada: [0xffb868, 2.4] },
];

function parede(id) { // textura que se repete na parede atrás da estante
  const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const x = cv.getContext('2d');
  if (id === 'sala') {
    x.fillStyle = '#efe4d0'; x.fillRect(0, 0, S, S);
    x.fillStyle = 'rgba(190,160,120,.18)';
    for (let i = 0; i < S; i += 32) x.fillRect(i, 0, 14, S);
  } else if (id === 'noite') {
    const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#0e1530'); g.addColorStop(1, '#1b2552');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 26; i++) {
      x.fillStyle = `rgba(255,248,220,${0.25 + Math.random() * 0.6})`;
      x.beginPath(); x.arc(Math.random() * S, Math.random() * S, Math.random() * 1.3 + 0.4, 0, 6.3); x.fill();
    }
  } else {
    x.fillStyle = '#2b1a0f'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 90; i++) {
      x.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.22)' : 'rgba(255,200,140,.06)';
      x.fillRect(Math.random() * S, 0, Math.random() * 2 + 0.5, S);
    }
    x.fillStyle = 'rgba(0,0,0,.45)';
    for (let i = 0; i < S; i += 64) x.fillRect(i, 0, 2, S);
  }
  const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.MirroredRepeatWrapping; return t;
}

function rotulo(txt, cor) { // nome do dono, escrito na frente da prateleira
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 80;
  const x = cv.getContext('2d');
  x.fillStyle = cor; x.font = '600 58px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  let s = String(txt);
  while (x.measureText(s).width > 480 && s.length > 2) s = s.slice(0, -2) + '…';
  x.fillText(s, 256, 42);
  const t = new T.CanvasTexture(cv); t.minFilter = T.LinearFilter; return t;
}

function rr(x, X, Y, w, h, r) { // retângulo com cantos arredondados [sup.esq, sup.dir, inf.dir, inf.esq]
  x.beginPath(); x.moveTo(X + r[0], Y); x.lineTo(X + w - r[1], Y); x.quadraticCurveTo(X + w, Y, X + w, Y + r[1]);
  x.lineTo(X + w, Y + h - r[2]); x.quadraticCurveTo(X + w, Y + h, X + w - r[2], Y + h);
  x.lineTo(X + r[3], Y + h); x.quadraticCurveTo(X, Y + h, X, Y + h - r[3]);
  x.lineTo(X, Y + r[0]); x.quadraticCurveTo(X, Y, X + r[0], Y); x.closePath();
}

function capaCanvas(c = {}, nome = '') { // desenho de reserva, para quem ainda não tem a foto do livro
  const W = 300, H = 400, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), m = METAIS[c.metal] || METAIS.prata;
  const metal = (X0, Y0, X1, Y1) => { const g = x.createLinearGradient(X0, Y0, X1, Y1); g.addColorStop(0, m[0]); g.addColorStop(0.55, m[1]); g.addColorStop(1, m[2]); return g; };
  x.save();
  x.fillStyle = c.cor || '#3a2a1a'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 500; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.1)'; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  const sp = x.createLinearGradient(0, 0, 46, 0);
  sp.addColorStop(0, 'rgba(0,0,0,.5)'); sp.addColorStop(0.7, 'rgba(0,0,0,.05)'); sp.addColorStop(1, 'rgba(255,255,255,.1)');
  x.fillStyle = sp; x.fillRect(0, 0, 46, H);
  x.restore();
  x.fillStyle = metal(W - 30, 170, W, 230); x.fillRect(W - 26, 170, 22, 60); // fecho
  if (EMBLEMA[c.e]) { x.fillStyle = metal(90, 130, 210, 270); x.font = '96px Georgia,serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(EMBLEMA[c.e], W / 2 + 8, H / 2); }
  if (c.txt || nome) {
    const np = c.np || 'ie', t = c.txt || '';
    if (t) {
      x.fillStyle = metal(60, 0, 240, 0); x.font = 'italic 30px Georgia,serif'; x.textBaseline = 'middle';
      x.textAlign = np.endsWith('d') ? 'right' : np.endsWith('e') ? 'left' : 'center';
      const X = x.textAlign === 'right' ? W - 36 : x.textAlign === 'left' ? 60 : W / 2 + 8;
      const Y = np === 'topo' || np === 'se' || np === 'sd' ? 52 : np === 'meio' ? H / 2 : H - 46;
      x.fillText(t, X, Y, 190);
    }
  }
  return cv;
}

function madeira(hex, vert) { // veios de madeira
  const W = 512, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  x.fillStyle = hex; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * 0.16;
    x.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,235,200,${a * 0.7})`;
    x.fillRect(0, Math.random() * H, W, Math.random() * 2.2 + 0.4);
  }
  x.strokeStyle = 'rgba(0,0,0,.10)'; x.lineWidth = 1;
  for (let i = 0; i < 10; i++) {
    const y0 = Math.random() * H; x.beginPath(); x.moveTo(0, y0);
    for (let u = 0; u <= W; u += 32) x.lineTo(u, y0 + Math.sin(u / 60 + i) * 2.5);
    x.stroke();
  }
  const t = new T.CanvasTexture(cv);
  if (vert) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
  return t;
}

function paginas(cor, tipo) { // borda do livro: folhas no meio e as capas nas pontas
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const x = cv.getContext('2d');
  x.fillStyle = '#efe6d2'; x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(120,100,70,.28)'; x.lineWidth = 1;
  for (let i = 8; i < S - 8; i += 3) { x.beginPath(); if (tipo === 'v') { x.moveTo(i, 0); x.lineTo(i, S); } else { x.moveTo(0, i); x.lineTo(S, i); } x.stroke(); }
  x.fillStyle = cor;
  if (tipo === 'v') { x.fillRect(0, 0, 9, S); x.fillRect(S - 9, 0, 9, S); } else { x.fillRect(0, 0, S, 9); x.fillRect(0, S - 9, S, 9); }
  return new T.CanvasTexture(cv);
}

function lombada(cor, m) { // lateral do livro com duas faixas de metal
  const W = 64, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  x.fillStyle = cor; x.fillRect(0, 0, W, H);
  const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(0.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const mg = x.createLinearGradient(0, 0, W, 0); mg.addColorStop(0, m[0]); mg.addColorStop(0.55, m[1]); mg.addColorStop(1, m[2]);
  x.fillStyle = mg; [24, 34, H - 34, H - 24].forEach((y) => x.fillRect(0, y, W, 4));
  return new T.CanvasTexture(cv);
}

function loadImg(url) {
  return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
}

async function texturaLivro(b) { // foto do livro 3D se existir; senão, desenho de reserva
  let src = null;
  if (b.thumb) { try { src = await loadImg(b.thumb); } catch (e) { src = null; } }
  if (!src) src = capaCanvas(b.cover, b.nome);
  const t = new T.Texture(src); t.minFilter = T.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return { tex: t, aspect: src.width / src.height };
}

function limpa(g) {
  for (const o of [...g.children]) {
    g.remove(o);
    o.traverse((n) => { if (n.geometry) n.geometry.dispose(); [].concat(n.material || []).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
  }
}

// books: [{ id, nome, voce, thumb, cover }]. onPick(book|null) é chamado ao tocar num livro.
export async function createShelf(stage, opts = {}) {
  const books = opts.books || [];
  let sc = CENARIOS.find((c) => c.id === opts.scenario) || CENARIOS[0];
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const el = renderer.domElement;
  stage.prepend(el);

  const scene = new T.Scene(), camera = new T.PerspectiveCamera(42, 1, 0.1, 60);
  const env = new T.Group(), livros = new T.Group(); scene.add(env, livros);
  const items = [], ray = new T.Raycaster(), ndc = new T.Vector2();
  let alive = true, raf = 0, need = true, camY = 1e9, vel = 0, drag = null, moved = 0, lastMove = 0;
  let dist = 8, visH = 4, sel = -1, topY = 0, botY = 0, last = performance.now();

  function limita() {
    const mx = topY - visH / 2 + 0.15, mn = botY + visH / 2 - 0.15;
    camY = mn > mx ? (topY + botY) / 2 : Math.min(mx, Math.max(mn, camY));
  }
  function fit() {
    const w = stage.clientWidth || 360, h = stage.clientHeight || 640;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const t = Math.tan(camera.fov * Math.PI / 360);
    dist = Math.max(((LARG + 2 * TAB + 0.8) / 2) / (t * camera.aspect), 1.5 / t);
    visH = 2 * dist * t; camera.position.z = dist; limita(); need = true;
  }
  const std = (o) => new T.MeshStandardMaterial(Object.assign({ roughness: 0.75, metalness: 0 }, o));

  function monta() { // parede, estante de madeira, luzes e nomes: tudo o que muda com o cenário
    limpa(env);
    stage.style.background = sc.fundo;
    const rows = Math.max(1, Math.ceil(books.length / POR_FILA));
    const coroa = 0.12, plinto = 0.22, cT = ALT + 0.3; // cT = altura do teto da primeira prateleira
    topY = cT + TAB + coroa; botY = -(rows - 1) * PASSO - TAB - plinto;
    const H = topY - botY, cy = (topY + botY) / 2;
    const yIn0 = botY + plinto, yIn1 = cT + TAB, Hu = yIn1 - yIn0, cyU = (yIn0 + yIn1) / 2;

    env.add(new T.HemisphereLight(sc.hemi[0], sc.hemi[1], sc.hemi[2]));
    const d = new T.DirectionalLight(sc.dir[0], sc.dir[1]);
    d.position.set(-2.5, cy + 4, 6); d.target.position.set(0, cy, 0); env.add(d, d.target);
    d.castShadow = true; d.shadow.mapSize.set(2048, 2048); d.shadow.bias = -0.0006;
    const sh = d.shadow.camera; sh.left = -3.6; sh.right = 3.6; sh.top = H / 2 + 2.5; sh.bottom = -(H / 2 + 2.5); sh.near = 1; sh.far = 18; sh.updateProjectionMatrix();
    if (sc.lampada) { const p = new T.PointLight(sc.lampada[0], sc.lampada[1], 7); p.position.set(1.3, topY - 0.4, 1.8); env.add(p); }

    const pw = 16, ph = H + 14, tex = parede(sc.id); tex.repeat.set(pw / 2, ph / 2);
    const wall = new T.Mesh(new T.PlaneGeometry(pw, ph), new T.MeshLambertMaterial({ map: tex }));
    wall.position.set(0, cy, -PROF / 2 - 0.12); wall.receiveShadow = true; env.add(wall);

    const escuro = '#' + new T.Color(sc.madeira).multiplyScalar(0.55).getHexString();
    const fundo = new T.Mesh(new T.PlaneGeometry(LARG, Hu), std({ map: madeira(escuro, true) }));
    fundo.position.set(0, cyU, -PROF / 2 + 0.005); fundo.receiveShadow = true; env.add(fundo);
    const peca = (w, h, dp, x, y, vert) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, dp), std({ map: madeira(sc.madeira, vert) }));
      m.position.set(x, y, 0); m.castShadow = m.receiveShadow = true; env.add(m);
    };
    for (let r = 0; r < rows; r++) peca(LARG, TAB, PROF, 0, -r * PASSO - TAB / 2, false);   // prateleiras
    peca(LARG, TAB, PROF, 0, cT + TAB / 2, false);                                            // teto
    peca(LARG + 0.4, coroa, PROF + 0.12, 0, cT + TAB + coroa / 2, false);                     // moldura de cima
    peca(LARG + TAB * 2 + 0.12, plinto, PROF + 0.1, 0, botY + plinto / 2, false);             // rodapé
    peca(TAB, Hu, PROF, -(LARG + TAB) / 2, cyU, true); peca(TAB, Hu, PROF, (LARG + TAB) / 2, cyU, true); // laterais

    books.forEach((b, i) => {
      const r = Math.floor(i / POR_FILA), c = i % POR_FILA;
      const m = new T.Mesh(new T.PlaneGeometry(0.9, 0.1406),
        new T.MeshBasicMaterial({ map: rotulo(b.voce ? `${b.nome} ✦` : b.nome, sc.rotulo), transparent: true }));
      m.position.set((c - 1) * CEL, -r * PASSO - TAB / 2, PROF / 2 + 0.002); env.add(m);
    });
  }

  function tinge() { // cenário noturno deixa os livros levemente azulados
    const t = new T.Color(sc.tint);
    items.forEach((it) => it.mats.forEach((m) => m.color.copy(m.userData.base).multiply(t)));
  }

  function montaLivros(res) { // cada livro é uma caixa de verdade: capa na frente, folhas na borda, lombada de lado
    books.forEach((b, i) => {
      const { tex, aspect } = res[i];
      const h = ALT * (0.96 + rnd(i * 7 + 3) * 0.08), w = Math.min(1.0, h * aspect), dp = 0.15 + rnd(i * 3 + 1) * 0.1;
      const r = Math.floor(i / POR_FILA), c = i % POR_FILA, x = (c - 1) * CEL + (rnd(i * 11 + 5) - 0.5) * 0.06, y = -r * PASSO;
      const cor = (b.cover && b.cover.cor) || '#2a2a2a', metal = METAIS[b.cover && b.cover.metal] || METAIS.prata;
      const base = (cor_) => new T.Color(cor_);
      const mats = [
        std({ map: paginas(cor, 'v') }), std({ map: lombada(cor, metal), roughness: 0.6 }),
        std({ map: paginas(cor, 'h') }), std({ map: paginas(cor, 'h') }),
        std({ map: tex, alphaTest: 0.5, roughness: 0.5 }), std({ color: base(cor), roughness: 0.7 }),
      ];
      mats.forEach((m, k) => { m.userData.base = k === 5 ? base(cor) : new T.Color(1, 1, 1); });
      const geo = new T.BoxGeometry(w, h, dp); geo.translate(0, h / 2, 0); // apoio na base
      const mesh = new T.Mesh(geo, mats); mesh.castShadow = mesh.receiveShadow = true;
      const zBase = -PROF / 2 + 0.09 + dp / 2 + rnd(i * 13 + 7) * 0.1;
      mesh.position.set(x, y, zBase); mesh.rotation.y = (rnd(i * 5 + 2) - 0.5) * 0.08; mesh.userData.i = i;
      livros.add(mesh); items.push({ mesh, mats, zBase, zSel: PROF / 2 - dp / 2 + 0.05 });
    });
    tinge();
  }

  let res;
  try { res = await Promise.all(books.map(texturaLivro)); } catch (e) { el.remove(); renderer.dispose(); throw e; }
  monta(); montaLivros(res); fit();

  function loop(now) {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    let sujo = need;
    if (!drag && Math.abs(vel) > 0.01) { camY += vel * dt; vel *= Math.exp(-dt * 4); limita(); sujo = true; } else if (!drag) vel = 0;
    items.forEach((it, i) => { // o livro tocado avança até a beira da prateleira
      const alvo = i === sel ? it.zSel : it.zBase, z = it.mesh.position.z;
      if (Math.abs(alvo - z) > 0.001) { it.mesh.position.z = z + (alvo - z) * (1 - Math.exp(-dt * 12)); sujo = true; }
    });
    if (sujo) { camera.position.y = camY; renderer.render(scene, camera); need = false; }
  }

  el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; moved = 0; vel = 0; lastMove = performance.now(); el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; moved += Math.abs(dx) + Math.abs(dy);
    const u = visH / (el.clientHeight || 1), n = performance.now(), hh = Math.max(0.008, (n - lastMove) / 1000); lastMove = n;
    camY += dy * u; vel = vel * 0.5 + 0.5 * (dy * u) / hh; vel = Math.max(-12, Math.min(12, vel)); limita(); need = true;
  });
  el.addEventListener('pointerup', (e) => {
    if (moved < 6) {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(items.map((it) => it.mesh))[0];
      const i = hit ? hit.object.userData.i : -1;
      sel = i === sel ? -1 : i; need = true; vel = 0;
      if (opts.onPick) opts.onPick(sel >= 0 ? books[sel] : null);
    } else if (performance.now() - lastMove > 90) vel = 0;
    drag = null;
  });
  el.addEventListener('pointercancel', () => { drag = null; });

  const ro = new ResizeObserver(() => fit()); ro.observe(stage);
  raf = requestAnimationFrame(loop);

  return {
    setScenario(id) {
      const novo = CENARIOS.find((c) => c.id === id); if (!novo) return;
      sc = novo; monta(); tinge(); fit();
    },
    destroy() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); limpa(env); limpa(livros);
      renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) { /* ignora */ } el.remove();
    },
  };
}
