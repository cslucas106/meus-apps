// Home: o livro com a capa personalizada. Tocar abre na página de hoje.
import * as api from '../api.js';
import * as clock from '../clock.js';
import { createBook } from '../livro3d.js';

const DEV = new URLSearchParams(location.search).has('dev');

export async function mount(root, ctx) {
  root.innerHTML = `
    <div id="stage">
      <div class="fab">
        <button class="c" id="sp">Girar 360°</button>
        <button class="c go" id="cv">Capa</button>
      </div>
    </div>
    <div class="cta" id="cta"></div>`;
  const $ = (id) => root.querySelector('#' + id);
  const hoje = clock.today();
  const [cover, cat, entry] = await Promise.all([api.getCover(), api.getCatalog(), api.getEntry(hoje)]);

  const frase = entry && cat.frases.find((f) => f.id === entry.fraseId);
  const opcao = frase && frase.opcoes.find((o) => o.id === entry.opcaoId);
  const texto = opcao ? `${frase.texto} ${opcao.palavra}` : '';

  const cta = $('cta');
  function atualizaCta(aberto) {
    cta.replaceChildren();
    if (!aberto) return;
    if (entry) { cta.textContent = 'O dia de hoje já está carimbado.'; return; }
    const b = document.createElement('button');
    b.className = 'c go'; b.textContent = 'Escolher minha frase de hoje';
    b.onclick = () => { location.hash = '#/hoje'; };
    cta.append(b);
  }

  const book = createBook($('stage'), { cfg: cover || {}, onWant: atualizaCta });
  book.setDay(hoje);
  if (DEV) window.__book = book;

  if (ctx.state.carimbou && texto) { ctx.state.carimbou = false; book.escrever(texto); } // acabou de carimbar: abre e escreve
  else if (texto) book.showText(texto);

  $('sp').onclick = () => book.spin();
  $('cv').onclick = () => { location.hash = '#/capa'; };
  if (DEV) { // modo de teste: botão de dados falsos
    const b = document.createElement('button');
    b.className = 'c'; b.textContent = 'Dados falsos';
    b.onclick = async () => { b.textContent = (await api.seedFake()) + ' dias'; };
    $('stage').querySelector('.fab').prepend(b);
  }
  return () => book.destroy();
}
