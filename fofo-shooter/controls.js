const stickR = document.getElementById('stickR');
const knobR = document.getElementById('knobR');
const btnL = document.getElementById('btnL');

window.Input = { x: 0, y: 0, shoot: false, aimX: 0, aimY: -1 };
window.touchJ = null;
let touchS = null;

window.clamp = (v, m, M) => v < m ? m : v > M ? M : v;
window.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

stickR.addEventListener('touchstart', e => { e.preventDefault(); window.touchJ = e.changedTouches[0].identifier; updateStick(e.changedTouches[0]); }, { passive: false });
stickR.addEventListener('touchmove', e => { e.preventDefault(); for (let t of e.changedTouches) if (t.identifier === window.touchJ) { updateStick(t); break } }, { passive: false });
stickR.addEventListener('touchend', e => { for (let t of e.changedTouches) if (t.identifier === window.touchJ) { window.touchJ = null; resetStick(); break } }, { passive: false });

btnL.addEventListener('touchstart', e => { e.preventDefault(); touchS = e.changedTouches[0].identifier; Input.shoot = true; resumeAudio(); }, { passive: false });
btnL.addEventListener('touchend', e => { for (let t of e.changedTouches) if (t.identifier === touchS) { touchS = null; Input.shoot = false; break } }, { passive: false });
btnL.addEventListener('touchcancel', e => { for (let t of e.changedTouches) if (t.identifier === touchS) { touchS = null; Input.shoot = false; break } }, { passive: false });

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w') { Input.y = -1; Input.aimX = 0; Input.aimY = -1; }
  if (e.key === 'ArrowDown' || e.key === 's') { Input.y = 1; Input.aimX = 0; Input.aimY = 1; }
  if (e.key === 'ArrowLeft' || e.key === 'a') { Input.x = -1; Input.aimX = -1; Input.aimY = 0; }
  if (e.key === 'ArrowRight' || e.key === 'd') { Input.x = 1; Input.aimX = 1; Input.aimY = 0; }
  if (e.code === 'Space') { Input.shoot = true; resumeAudio(); }
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'w') Input.y = 0;
  if (e.key === 'ArrowDown' || e.key === 's') Input.y = 0;
  if (e.key === 'ArrowLeft' || e.key === 'a') Input.x = 0;
  if (e.key === 'ArrowRight' || e.key === 'd') Input.x = 0;
  if (e.code === 'Space') Input.shoot = false;
});

window.addEventListener('resize', () => { stickR.style.right = '20px'; btnL.style.left = '20px'; });

function updateStick(t) {
  const r = stickR.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const dx = t.clientX - cx, dy = t.clientY - cy;
  const d = Math.hypot(dx, dy), maxR = 45;
  const a = Math.atan2(dy, dx);
  const cd = Math.min(d, maxR);
  Input.x = Math.cos(a) * cd / maxR;
  Input.y = Math.sin(a) * cd / maxR;
  if (cd > 15) { Input.aimX = Math.cos(a); Input.aimY = Math.sin(a); }
  knobR.style.transform = `translate(${Math.cos(a) * cd}px, ${Math.sin(a) * cd}px)`;
}
function resetStick() { Input.x = Input.y = 0; knobR.style.transform = 'translate(0,0)'; }