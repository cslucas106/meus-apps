// Dump: resumo do mês ou do ano em imagem 9:16 (para salvar ou compartilhar).
import * as api from '../api.js';
import { today, monthKey } from '../clock.js';
import { calcMes, calcAno, nomeMes } from '../dump.js';
import { desenhar, desenharAno, baixar, compartilhar, podeCompartilhar } from '../share.js';

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
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export async function mount(root) {
  const hoje = today();
  const [cat, lista] = await Promise.all([api.getCatalog(), api.listEntries('')]); // '' = todos
  const primeiro = lista.length ? lista[0].data : hoje;
  const lim = { mes: [monthKey(primeiro), monthKey(hoje)], ano: [primeiro.slice(0, 4), hoje.slice(0, 4)] };
  const st = { tipo: 'mes', mes: monthKey(hoje), ano: hoje.slice(0, 4), msg: '', ocupado: false };

  const body = h('div', { class: 'dbody' });
  const foot = h('div', { class: 'dfoot' });
  root.append(h('header', { class: 'top' }, h('div', {}, h('h1', {}, 'Dump'), h('small', {}, 'O resumo do seu mês e do seu ano'))), body, foot);

  function muda(delta) {
    if (st.tipo === 'mes') {
      let [y, m] = st.mes.split('-').map(Number);
      m += delta;
      if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
      st.mes = `${y}-${String(m).padStart(2, '0')}`;
    } else st.ano = String(Number(st.ano) + delta);
    st.msg = '';
    render();
  }

  async function acao(fn) {
    if (st.ocupado) return;
    st.ocupado = true; st.msg = ''; render();
    try { await fn(); } catch (e) { st.msg = e.message || 'Algo deu errado.'; }
    st.ocupado = false; render();
  }

  function render() {
    const mensal = st.tipo === 'mes';
    const chave = mensal ? st.mes : st.ano;
    const [min, max] = lim[st.tipo];
    const dados = mensal
      ? calcMes(lista.filter((e) => e.data.startsWith(st.mes)), cat, st.mes, hoje)
      : calcAno(lista.filter((e) => e.data.startsWith(st.ano)), cat, st.ano, hoje);
    const nome = `monodiario-${chave}`;

    body.replaceChildren(
      h('div', { class: 'dtabs' },
        h('button', { class: 'dtab' + (mensal ? ' on' : ''), onclick: () => { st.tipo = 'mes'; st.msg = ''; render(); } }, 'Mensal'),
        h('button', { class: 'dtab' + (!mensal ? ' on' : ''), onclick: () => { st.tipo = 'ano'; st.msg = ''; render(); } }, 'Anual')),
      h('div', { class: 'mesbar' },
        h('button', { class: 'c', 'aria-label': mensal ? 'Mês anterior' : 'Ano anterior', disabled: chave <= min, onclick: () => muda(-1) }, '‹'),
        h('span', {}, mensal ? cap(nomeMes(st.mes)) : st.ano),
        h('button', { class: 'c', 'aria-label': mensal ? 'Próximo mês' : 'Próximo ano', disabled: chave >= max, onclick: () => muda(1) }, '›')));
    foot.replaceChildren();

    if (dados.vazio) {
      body.append(h('p', { class: 'dvazio' }, mensal ? 'Nenhum registro neste mês, então não há o que resumir.' : 'Nenhum registro neste ano, então não há o que resumir.'));
      return;
    }
    const canvas = h('canvas', { class: 'dcard' });
    (mensal ? desenhar : desenharAno)(canvas, dados);
    body.append(h('div', { class: 'dwrap' }, canvas));
    if (!dados.fechado) body.append(h('p', { class: 'dnota' }, mensal ? 'Mês em andamento: o resumo muda até o último dia.' : 'Ano em andamento: o resumo muda até o último dia.'));
    if (st.msg) foot.append(h('p', { class: 'msg' }, st.msg));
    const botoes = [];
    if (podeCompartilhar()) botoes.push(h('button', { class: 'btn', disabled: st.ocupado, onclick: () => acao(() => compartilhar(canvas, nome)) }, 'Compartilhar'));
    botoes.push(h('button', { class: 'btn' + (botoes.length ? ' ghost' : ''), disabled: st.ocupado, onclick: () => acao(() => baixar(canvas, nome)) }, 'Salvar imagem'));
    foot.append(h('div', { class: 'row' }, botoes));
  }
  render();
}
