// Gera o card do dump em <canvas> (1080x1920) e exporta: compartilhar (celular) ou baixar.
import { nomeMes } from './dump.js';

export const W = 1080, H = 1920;
const SERIF = 'Georgia,"Times New Roman",serif';
const SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const EMOJI = '"Apple Color Emoji","Noto Color Emoji","Segoe UI Emoji",sans-serif';

function quebra(ctx, texto, max) {
  const linhas = []; let atual = '';
  for (const p of texto.split(' ')) {
    const t = atual ? atual + ' ' + p : p;
    if (ctx.measureText(t).width > max && atual) { linhas.push(atual); atual = p; } else atual = t;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function desenhar(canvas, d) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const cor = d.vencedor.cor;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b130d'); g.addColorStop(1, '#0d0805');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W / 2, 700, 40, W / 2, 700, 700); r.addColorStop(0, cor + '55'); r.addColorStop(1, cor + '00');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#d8b25a'; ctx.font = `600 34px ${SANS}`; if ('letterSpacing' in ctx) ctx.letterSpacing = '10px';
  ctx.fillText('MONODIÁRIO', W / 2, 150); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = '#f1e7d6'; ctx.font = `italic 68px ${SERIF}`; ctx.fillText(cap(nomeMes(d.mes)), W / 2, 260);
  ctx.globalAlpha = .6; ctx.font = `38px ${SANS}`; ctx.fillText(d.fechado ? 'O sentimento do mês' : 'O sentimento até agora', W / 2, 420); ctx.globalAlpha = 1;

  ctx.font = `330px ${EMOJI}`; ctx.fillText(d.vencedor.emoji, W / 2, 800);
  ctx.fillStyle = '#f3d98f'; ctx.font = `italic 128px ${SERIF}`; ctx.fillText(d.vencedor.nome, W / 2, 990);
  let y = 1050;
  if (d.viaSoma) { ctx.globalAlpha = .6; ctx.fillStyle = '#f1e7d6'; ctx.font = `italic 34px ${SERIF}`; ctx.fillText('resultado lido pela soma dos dias', W / 2, y); ctx.globalAlpha = 1; }
  y = 1130;
  ctx.fillStyle = '#f1e7d6'; ctx.font = `44px ${SERIF}`;
  quebra(ctx, d.texto, 820).slice(0, 4).forEach((l, i) => ctx.fillText(l, W / 2, y + i * 62));

  // ranking: 3 mais frequentes
  const top = d.ranking.slice(0, 3), maxN = top[0].n, x0 = 130, larg = 820;
  top.forEach((c, i) => {
    const yy = 1420 + i * 100;
    ctx.textAlign = 'left'; ctx.fillStyle = '#f1e7d6'; ctx.font = `36px ${EMOJI}`; ctx.fillText(c.emoji, x0, yy);
    ctx.font = `34px ${SANS}`; ctx.fillText(c.nome, x0 + 60, yy);
    ctx.textAlign = 'right'; ctx.globalAlpha = .7; ctx.fillText(`${c.n} ${c.n === 1 ? 'dia' : 'dias'}`, x0 + larg, yy); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x0, yy + 18, larg, 12);
    ctx.fillStyle = c.cor; ctx.fillRect(x0, yy + 18, Math.max(12, larg * c.n / maxN), 12);
  });

  ctx.textAlign = 'center'; ctx.fillStyle = '#f1e7d6'; ctx.globalAlpha = .6; ctx.font = `36px ${SANS}`;
  const reg = `${d.registrados} ${d.registrados === 1 ? 'dia registrado' : 'dias registrados'}`;
  ctx.fillText(d.brancos ? `${reg} · ${d.brancos} em branco` : reg, W / 2, 1810); ctx.globalAlpha = 1;
  return canvas;
}

const paraBlob = (canvas) => new Promise((ok, no) => canvas.toBlob((b) => (b ? ok(b) : no(new Error('Não consegui gerar a imagem.'))), 'image/png'));

export async function baixar(canvas, nome) {
  const url = URL.createObjectURL(await paraBlob(canvas));
  const a = Object.assign(document.createElement('a'), { href: url, download: nome + '.png' });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export const podeCompartilhar = () => {
  try { return !!navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] }); } catch { return false; }
};

export async function compartilhar(canvas, nome) {
  const file = new File([await paraBlob(canvas)], nome + '.png', { type: 'image/png' });
  try { await navigator.share({ files: [file], title: 'Monodiário' }); }
  catch (e) { if (e.name !== 'AbortError') throw e; }
}

/* ---------- card do dump anual ---------- */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export function desenharAno(canvas, d) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const cor = d.vencedor.cor;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b130d'); g.addColorStop(1, '#0d0805');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 620); r.addColorStop(0, cor + '55'); r.addColorStop(1, cor + '00');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#d8b25a'; ctx.font = `600 34px ${SANS}`; if ('letterSpacing' in ctx) ctx.letterSpacing = '10px';
  ctx.fillText('MONODIÁRIO', W / 2, 130); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = '#f1e7d6'; ctx.font = `italic 100px ${SERIF}`; ctx.fillText(d.ano, W / 2, 250);
  ctx.globalAlpha = .6; ctx.font = `36px ${SANS}`; ctx.fillText(d.fechado ? 'O sentimento do ano' : 'O sentimento do ano até agora', W / 2, 330); ctx.globalAlpha = 1;

  ctx.font = `250px ${EMOJI}`; ctx.fillText(d.vencedor.emoji, W / 2, 620);
  ctx.fillStyle = '#f3d98f'; ctx.font = `italic 104px ${SERIF}`; ctx.fillText(d.vencedor.nome, W / 2, 760);
  if (d.viaSoma) { ctx.globalAlpha = .6; ctx.fillStyle = '#f1e7d6'; ctx.font = `italic 32px ${SERIF}`; ctx.fillText('resultado lido pela soma dos dias', W / 2, 810); ctx.globalAlpha = 1; }

  ctx.fillStyle = '#f1e7d6'; ctx.font = `42px ${SERIF}`;
  quebra(ctx, d.textoSemana, 860).slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 900 + i * 58));

  // dia da semana x sentimento
  const y0 = 1062, lh = 66;
  d.semana.forEach((s, i) => {
    const y = y0 + i * lh;
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(130, y + 18, 820, 2);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f1e7d6'; ctx.font = `34px ${SANS}`; ctx.fillText(cap(s.nome), 130, y);
    ctx.textAlign = 'right';
    if (s.top) { ctx.fillText(s.top.nome, 950, y); const w = ctx.measureText(s.top.nome).width; ctx.font = `34px ${EMOJI}`; ctx.fillText(s.top.emoji, 950 - w - 16, y); }
    else { ctx.globalAlpha = .4; ctx.fillText('—', 950, y); ctx.globalAlpha = 1; }
  });

  // mês mais intenso e maior sequência
  const caixa = (x, rot, linhas) => {
    ctx.fillStyle = 'rgba(255,255,255,.06)'; rr(ctx, x, 1540, 400, 170, 24); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#f1e7d6'; ctx.globalAlpha = .6; ctx.font = `28px ${SANS}`; ctx.fillText(rot, x + 200, 1590); ctx.globalAlpha = 1;
    linhas();
  };
  caixa(130, 'Mês mais intenso', () => {
    if (!d.mesIntenso) return;
    ctx.fillStyle = '#f3d98f'; ctx.font = `italic 50px ${SERIF}`; ctx.fillText(cap(d.mesIntenso.nome), 330, 1655);
    ctx.fillStyle = '#f1e7d6'; ctx.font = `34px ${EMOJI}`; ctx.fillText(d.mesIntenso.vencedor.emoji, 330, 1698);
  });
  caixa(550, 'Maior sequência', () => {
    ctx.fillStyle = '#f3d98f'; ctx.font = `italic 64px ${SERIF}`; ctx.fillText(String(d.sequencia.n), 750, 1662);
    ctx.fillStyle = '#f1e7d6'; ctx.font = `30px ${SANS}`; ctx.fillText(d.sequencia.n === 1 ? 'dia seguido' : 'dias seguidos', 750, 1700);
  });

  ctx.textAlign = 'center'; ctx.fillStyle = '#f1e7d6'; ctx.globalAlpha = .6; ctx.font = `34px ${SANS}`;
  const reg = `${d.registrados} ${d.registrados === 1 ? 'dia registrado' : 'dias registrados'}`;
  ctx.fillText(d.brancos ? `${reg} · ${d.brancos} em branco` : reg, W / 2, 1820); ctx.globalAlpha = 1;
  return canvas;
}
