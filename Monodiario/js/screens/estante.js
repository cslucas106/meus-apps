// Estante: livros lado a lado, só capa e nome. Nesta fase: o seu livro + perfis falsos.
import * as api from '../api.js';

const METAIS = {
  ouro: ['#f6dd9e', '#c9a24e', '#f0d58a'], prata: ['#ffffff', '#aab0b8', '#eef1f5'],
  bronze: ['#e0b080', '#9c6a38', '#d6a572'], cobre: ['#f0a47e', '#b4562f', '#e8946c'],
};
const EMBLEMA = { luas: '☾', arvore: '❦', solua: '☼', mandala: '❂', flor: '⚜', bussola: '✥', brasao: '❖', coroa: '♛' };
const TEXTURA = { couro: 'grao', enrugado: 'grao', avestruz: 'grao', camurca: 'grao', veludo: 'grao', craquelado: 'grao', linho: 'trama', saffiano: 'trama', madeira: 'veio', cortica: 'veio', croco: 'escama', liso: 'liso' };
const POR_FILA = 3;

const h = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...kids.flat().filter((x) => x != null && x !== false));
  return e;
};

function capa(c, nome, thumb) {
  if (thumb) return h('img', { class: 'capa-foto', src: thumb, alt: `Livro de ${nome}` });
  const m = METAIS[c.metal] || METAIS.prata;
  const livro = h('div', {
    class: `capa t-${TEXTURA[c.t] || 'liso'} np-${c.np || 'ie'}` + (c.e === 'moldura' ? ' moldura' : ''),
    style: `--cor:${c.cor};--pg:${c.pg};--m0:${m[0]};--m1:${m[1]};--m2:${m[2]}`,
    role: 'img', 'aria-label': `Livro de ${nome}`,
  }, h('i', { class: 'fecho' }));
  if (EMBLEMA[c.e]) livro.append(h('b', { class: 'emb' }, EMBLEMA[c.e]));
  if (c.txt) livro.append(h('span', { class: 'tit' }, c.txt));
  return livro;
}

function montarCSS(root, lista) { // plano B: estante antiga em CSS, se o WebGL falhar
  const body = h('div', { class: 'ebody' });
  root.append(
    h('header', { class: 'top' }, h('div', {}, h('h1', {}, 'Estante'), h('small', {}, 'Só a capa e o nome aparecem aqui'))),
    body);
  for (let i = 0; i < lista.length; i += POR_FILA) {
    const fila = lista.slice(i, i + POR_FILA);
    body.append(h('div', { class: 'fila' },
      h('div', { class: 'livros' }, fila.map((p) => capa(p.cover, p.nome, p.thumb))),
      h('div', { class: 'tabua' }, fila.map((p) => h('span', { class: p.voce ? 'voce' : '' }, p.voce ? `${p.nome} ✦` : p.nome)))));
  }
  body.append(h('p', { class: 'enota' }, 'Perfis de teste: na próxima fase entram as pessoas do seu grupo.'));
}

async function gerarFoto() { // tira a foto do seu livro 3D num palco escondido (para quem ainda não salvou a capa)
  const { createBook } = await import('../livro3d.js');
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:-9999px;top:0;width:360px;height:480px';
  document.body.append(box);
  try {
    const bk = createBook(box, { cfg: (await api.getCover()) || {} });
    const url = bk.snapshot(); bk.destroy();
    await api.saveCoverThumb(url);
  } finally { box.remove(); }
}

export async function mount(root) {
  if (window.THREE && !(await api.getCoverThumb())) { try { await gerarFoto(); } catch (e) { console.error(e); } }
  const lista = await api.listShelf();
  if (!window.THREE) return montarCSS(root, lista);
  const { createShelf, CENARIOS } = await import('../estante3d.js');
  root.innerHTML = '<header class="top"><div><h1>Estante</h1><small>Só a capa e o nome aparecem aqui</small></div></header><div class="estage"></div><div class="cenas"></div><div class="cta"></div>';
  const stage = root.querySelector('.estage'), cenas = root.querySelector('.cenas'), cta = root.querySelector('.cta');
  const onPick = (b) => {
    cta.replaceChildren();
    if (!b) return;
    if (b.voce) {
      const bt = h('button', { class: 'c go' }, 'Editar minha capa');
      bt.onclick = () => { location.hash = '#/capa'; };
      cta.append(bt);
    } else cta.append(h('span', {}, `${b.nome} · pedir para ver: em breve`));
  };
  let shelf;
  try { shelf = await createShelf(stage, { books: lista, scenario: await api.getScenario(), onPick }); } catch (e) {
    console.error(e); root.replaceChildren(); return montarCSS(root, lista);
  }
  const atual = await api.getScenario();
  CENARIOS.forEach((c) => {
    const bt = h('button', { class: 'c' + (c.id === atual ? ' on' : '') }, c.nome);
    bt.onclick = () => {
      shelf.setScenario(c.id); api.saveScenario(c.id);
      cenas.querySelectorAll('.c').forEach((x) => x.classList.toggle('on', x === bt));
    };
    cenas.append(bt);
  });
  return () => shelf.destroy();
}
