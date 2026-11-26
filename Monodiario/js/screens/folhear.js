// Folhear: calendário do mês (com o sentimento de cada dia) + a "página" do dia escolhido.
// Dia sem registro = página em branco. Só o dono vê isto.
import * as api from '../api.js';
import { today, addDays, monthKey, formatLong } from '../clock.js';

const h = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...kids.flat().filter((x) => x != null && x !== false));
  return e;
};

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const pad = (n) => String(n).padStart(2, '0');

export async function mount(root) {
  const hoje = today();
  const [cat, lista] = await Promise.all([api.getCatalog(), api.listEntries('')]); // '' = todos os registros
  const cats = Object.fromEntries(cat.categorias.map((c) => [c.id, c]));
  const reg = Object.fromEntries(lista.map((e) => [e.data, e]));

  const minMes = lista.length ? monthKey(lista[0].data) : monthKey(hoje); // listEntries já vem em ordem
  const maxMes = monthKey(hoje);
  const st = { sel: hoje, mes: maxMes };

  const body = h('div', { class: 'fbody' });
  root.append(h('header', { class: 'top' }, h('div', {}, h('h1', {}, 'Folhear'), h('small', {}, 'Seus dias, página por página'))), body);

  const textoDe = (e) => {
    const f = cat.frases.find((x) => x.id === e.fraseId);
    const o = f && f.opcoes.find((x) => x.id === e.opcaoId);
    return o ? `${f.texto} ${o.palavra}` : '';
  };

  function irPara(data) {
    st.sel = data;
    st.mes = monthKey(data);
    render();
  }

  function mudaMes(delta) {
    let [y, m] = st.mes.split('-').map(Number);
    m += delta;
    if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
    st.mes = `${y}-${pad(m)}`;
    render();
  }

  function calendario() {
    const [y, m] = st.mes.split('-').map(Number);
    const primeiro = new Date(y, m - 1, 1).getDay();
    const total = new Date(y, m, 0).getDate();
    const grade = h('div', { class: 'cal' }, SEMANA.map((s) => h('span', { class: 'dow' }, s)));
    for (let i = 0; i < primeiro; i++) grade.append(h('span', { class: 'vazio' }));
    for (let d = 1; d <= total; d++) {
      const data = `${st.mes}-${pad(d)}`;
      const e = reg[data];
      const c = e && cats[e.categoria];
      grade.append(h('button', {
        class: 'dia' + (data === st.sel ? ' sel' : '') + (data === hoje ? ' hoje' : '') + (c ? ' cheio' : ''),
        style: c ? `background:${c.cor}33` : '',
        disabled: data > hoje,
        'aria-label': data,
        onclick: () => irPara(data),
      }, h('b', {}, String(d)), h('i', {}, c ? c.emoji : '')));
    }
    return grade;
  }

  function pagina() {
    const e = reg[st.sel];
    const c = e && cats[e.categoria];
    const txt = e ? textoDe(e) : '';
    const ant = addDays(st.sel, -1), prox = addDays(st.sel, 1);
    const conteudo = [];
    if (txt) {
      conteudo.push(h('p', { class: 'ptxt' }, txt), h('p', { class: 'pcat' }, `${c ? c.emoji + ' ' + c.nome : ''}`));
    } else if (st.sel === hoje) {
      conteudo.push(h('p', { class: 'pbranco' }, 'Hoje ainda está em branco.'),
        h('button', { class: 'btn', onclick: () => { location.hash = '#/hoje'; } }, 'Escolher minha frase de hoje'));
    } else {
      conteudo.push(h('p', { class: 'pbranco' }, 'Página em branco.'), h('p', { class: 'pcat' }, 'Nenhum registro neste dia.'));
    }
    return h('section', { class: 'pagina' },
      h('div', { class: 'pnav' },
        h('button', { class: 'c', 'aria-label': 'Dia anterior', disabled: monthKey(ant) < minMes, onclick: () => irPara(ant) }, '‹'),
        h('small', {}, formatLong(st.sel)),
        h('button', { class: 'c', 'aria-label': 'Dia seguinte', disabled: prox > hoje, onclick: () => irPara(prox) }, '›')),
      h('div', { class: 'pfolha' }, conteudo));
  }

  function render() {
    const [y, m] = st.mes.split('-').map(Number);
    const sc = body.scrollTop;
    body.replaceChildren(
      h('div', { class: 'mesbar' },
        h('button', { class: 'c', 'aria-label': 'Mês anterior', disabled: st.mes <= minMes, onclick: () => mudaMes(-1) }, '‹'),
        h('span', {}, `${MESES[m - 1]} ${y}`),
        h('button', { class: 'c', 'aria-label': 'Próximo mês', disabled: st.mes >= maxMes, onclick: () => mudaMes(1) }, '›')),
      calendario(),
      pagina());
    body.scrollTop = sc;
  }
  render();
}
