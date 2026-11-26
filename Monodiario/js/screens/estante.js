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

function capa(c, nome) {
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

export async function mount(root) {
  const lista = await api.listShelf();
  const body = h('div', { class: 'ebody' });
  root.append(
    h('header', { class: 'top' }, h('div', {}, h('h1', {}, 'Estante'), h('small', {}, 'Só a capa e o nome aparecem aqui'))),
    body);
  for (let i = 0; i < lista.length; i += POR_FILA) {
    const fila = lista.slice(i, i + POR_FILA);
    body.append(h('div', { class: 'fila' },
      h('div', { class: 'livros' }, fila.map((p) => capa(p.cover, p.nome))),
      h('div', { class: 'tabua' }, fila.map((p) => h('span', { class: p.voce ? 'voce' : '' }, p.voce ? `${p.nome} ✦` : p.nome)))));
  }
  body.append(h('p', { class: 'enota' }, 'Perfis de teste: na próxima fase entram as pessoas do seu grupo.'));
}
