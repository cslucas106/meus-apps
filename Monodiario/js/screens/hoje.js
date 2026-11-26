// Hoje: passo 1 escolhe a frase de abertura, passo 2 a palavra. Confirmar carimba e trava o dia.
import * as api from '../api.js';
import { today, formatLong } from '../clock.js';

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

export async function mount(root, ctx) {
  const hoje = today();
  const [cat, entry] = await Promise.all([api.getCatalog(), api.getEntry(hoje)]);
  const st = { frase: null, opcao: null, confirmar: false, erro: '' };

  const body = h('div', { class: 'hbody' });
  const foot = h('div', { class: 'hfoot' });
  root.append(
    h('header', { class: 'top' },
      h('button', { class: 'c', onclick: () => { location.hash = '#/'; } }, '← Livro'),
      h('div', {}, h('h1', {}, 'Hoje'), h('small', {}, formatLong(hoje)))),
    body, foot);

  const verNoLivro = () => { location.hash = '#/'; };

  async function carimbar() {
    try {
      await api.saveEntry(hoje, st.frase.id, st.opcao.id);
      ctx.state.carimbou = true;   // o livro abre e escreve a frase com brilho
      location.hash = '#/';
    } catch (e) {
      st.confirmar = false;
      st.erro = e.code === 'locked' ? 'O dia virou. Recarregue a página para registrar o novo dia.' : e.message;
      render();
    }
  }

  function render() {
    body.replaceChildren(); foot.replaceChildren();

    if (entry) { // dia já carimbado
      const f = cat.frases.find((x) => x.id === entry.fraseId);
      const o = f && f.opcoes.find((x) => x.id === entry.opcaoId);
      body.append(h('div', { class: 'carimbo' }, o ? `${f.texto} ${o.palavra}` : '', h('small', {}, 'carimbado')));
      foot.append(h('p', { class: 'aviso' }, 'Seu registro de hoje está travado. Amanhã tem outro.'),
        h('button', { class: 'btn', onclick: verNoLivro }, 'Ver no livro'));
      return;
    }

    if (!st.frase) {
      body.append(h('p', { class: 'q' }, 'Como você quer começar a frase de hoje?'),
        h('div', { class: 'opts' }, cat.frases.map((f) =>
          h('button', { class: 'opt', onclick: () => { st.frase = f; st.opcao = null; st.erro = ''; render(); } }, f.texto))));
      foot.append(h('p', { class: 'preview dim' }, 'Escolha uma frase'));
      return;
    }

    body.append(
      h('p', { class: 'q' }, 'Sua frase: ',
        h('b', {}, st.frase.texto), ' ',
        h('button', { class: 'link', onclick: () => { st.frase = null; st.opcao = null; st.confirmar = false; render(); } }, 'trocar')),
      h('p', { class: 'q' }, 'Complete com uma palavra:'),
      h('div', { class: 'words' }, st.frase.opcoes.map((o) =>
        h('button', { class: 'word' + (st.opcao === o ? ' on' : ''), onclick: () => { st.opcao = o; st.erro = ''; render(); } }, o.palavra))));

    const previa = st.opcao ? `${st.frase.texto} ${st.opcao.palavra}` : '';
    if (st.erro) foot.append(h('p', { class: 'msg' }, st.erro));
    if (st.confirmar && st.opcao) {
      foot.append(
        h('p', { class: 'preview' }, previa),
        h('p', { class: 'aviso' }, 'Depois de carimbado, o dia trava e não dá para mudar.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn ghost', onclick: () => { st.confirmar = false; render(); } }, 'Voltar'),
          h('button', { class: 'btn', onclick: carimbar }, 'Carimbar')));
    } else {
      foot.append(
        h('p', { class: 'preview' + (previa ? '' : ' dim') }, previa || 'Escolha uma palavra'),
        h('button', { class: 'btn', disabled: !st.opcao, onclick: () => { st.confirmar = true; render(); } }, 'Confirmar'));
    }
  }
  render();
}
