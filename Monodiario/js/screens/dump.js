// Dump: resumo do mês em imagem 9:16 (para salvar ou compartilhar). Só o dono vê isto até compartilhar.
import * as api from '../api.js';
import { today, monthKey } from '../clock.js';
import { calcMes, nomeMes } from '../dump.js';
import { desenhar, baixar, compartilhar, podeCompartilhar } from '../share.js';

const h = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...kids.flat().filter((x) => x != null && x !== false));
  return e;
};

export async function mount(root) {
  const hoje = today();
  const [cat, lista] = await Promise.all([api.getCatalog(), api.listEntries('')]); // '' = todos
  const minMes = lista.length ? monthKey(lista[0].data) : monthKey(hoje);
  const maxMes = monthKey(hoje);
  const st = { mes: maxMes, msg: '', ocupado: false };
  let dados = null;

  const body = h('div', { class: 'dbody' });
  const foot = h('div', { class: 'dfoot' });
  root.append(h('header', { class: 'top' }, h('div', {}, h('h1', {}, 'Dump'), h('small', {}, 'O resumo do seu mês'))), body, foot);

  function mudaMes(delta) {
    let [y, m] = st.mes.split('-').map(Number);
    m += delta;
    if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
    st.mes = `${y}-${String(m).padStart(2, '0')}`; st.msg = '';
    render();
  }

  async function acao(fn) {
    if (st.ocupado) return;
    st.ocupado = true; st.msg = ''; render();
    try { await fn(); } catch (e) { st.msg = e.message || 'Algo deu errado.'; }
    st.ocupado = false; render();
  }

  function render() {
    const entradas = lista.filter((e) => e.data.startsWith(st.mes));
    dados = calcMes(entradas, cat, st.mes, hoje);
    const nome = `monodiario-${st.mes}`;

    body.replaceChildren(
      h('div', { class: 'mesbar' },
        h('button', { class: 'c', 'aria-label': 'Mês anterior', disabled: st.mes <= minMes, onclick: () => mudaMes(-1) }, '‹'),
        h('span', {}, nomeMes(st.mes).replace(/^./, (c) => c.toUpperCase())),
        h('button', { class: 'c', 'aria-label': 'Próximo mês', disabled: st.mes >= maxMes, onclick: () => mudaMes(1) }, '›')));
    foot.replaceChildren();

    if (dados.vazio) {
      body.append(h('p', { class: 'dvazio' }, 'Nenhum registro neste mês, então não há o que resumir.'));
      return;
    }
    const canvas = h('canvas', { class: 'dcard' });
    desenhar(canvas, dados);
    body.append(h('div', { class: 'dwrap' }, canvas));
    if (!dados.fechado) body.append(h('p', { class: 'dnota' }, 'Mês em andamento: o resumo muda até o último dia.'));
    if (st.msg) foot.append(h('p', { class: 'msg' }, st.msg));
    const botoes = [];
    if (podeCompartilhar()) botoes.push(h('button', { class: 'btn', disabled: st.ocupado, onclick: () => acao(() => compartilhar(canvas, nome)) }, 'Compartilhar'));
    botoes.push(h('button', { class: 'btn' + (botoes.length ? ' ghost' : ''), disabled: st.ocupado, onclick: () => acao(() => baixar(canvas, nome)) }, 'Salvar imagem'));
    foot.append(h('div', { class: 'row' }, botoes));
  }
  render();
}
