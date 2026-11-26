// Fase 1: localStorage + data/frases.json.
// Fase 2: trocar por fetch() para o Worker, mantendo estas mesmas funções.
// Nenhuma tela chama localStorage, fetch ou window.Telegram direto: tudo passa por aqui.
import { today, addDays } from './clock.js';
import { getUser } from './auth.js';

const key = (k) => `monodiario:v1:${getUser().id}:${k}`;
const read = (k, def) => { try { const v = localStorage.getItem(key(k)); return v ? JSON.parse(v) : def; } catch { return def; } };
const write = (k, v) => localStorage.setItem(key(k), JSON.stringify(v));
const erro = (code, msg) => Object.assign(new Error(msg), { code });

let catalogo = null;
export function getCatalog() {
  return catalogo || (catalogo = fetch('./data/frases.json')
    .then((r) => { if (!r.ok) throw new Error('frases.json: ' + r.status); return r.json(); })
    .catch((e) => { catalogo = null; throw e; }));
}

export async function getEntry(date) {
  return read('entries', {})[date] || null;
}

// Regras que o Worker repetirá na Fase 2: só o dia de hoje, a opção precisa pertencer à frase
// e o dia só aceita um registro (carimbou, travou).
export async function saveEntry(date, fraseId, opcaoId) {
  if (date !== today()) throw erro('locked', 'Só o dia de hoje pode ser registrado.');
  const cat = await getCatalog();
  const frase = cat.frases.find((f) => f.id === fraseId);
  const opcao = frase && frase.opcoes.find((o) => o.id === opcaoId);
  if (!opcao) throw erro('invalid', 'Essa palavra não pertence a essa frase.');
  const all = read('entries', {});
  if (all[date]) throw erro('already', 'O dia de hoje já foi carimbado.');
  all[date] = { fraseId, opcaoId, categoria: opcao.categoria }; // categoria copiada no registro
  write('entries', all);
  return all[date];
}

export async function listEntries(mes) { // mes = 'AAAA-MM'
  const all = read('entries', {});
  return Object.keys(all).filter((d) => d.startsWith(mes)).sort().map((d) => ({ data: d, ...all[d] }));
}

export async function getCover() { return read('cover', null); }
export async function saveCover(cfg) { write('cover', cfg); }
export async function getScenario() { return read('scenario', 'classico'); } // cenário da "casa" (vale para a estante; depois, para o início)
export async function saveScenario(id) { write('scenario', id); }
export async function saveCoverThumb(dataUrl) { write('coverThumb2', dataUrl); }
export async function getCoverThumb() { return read('coverThumb2', null); } // foto do livro 3D para a estante

// Modo de teste: preenche ~90 dias anteriores com escolhas aleatórias (~15% em branco).
export async function seedFake() {
  const cat = await getCatalog();
  const all = read('entries', {});
  const hoje = today();
  for (let i = 1; i <= 90; i++) {
    const d = addDays(hoje, -i);
    if (all[d] || Math.random() < 0.15) continue;
    const f = cat.frases[Math.floor(Math.random() * cat.frases.length)];
    const o = f.opcoes[Math.floor(Math.random() * f.opcoes.length)];
    all[d] = { fraseId: f.id, opcaoId: o.id, categoria: o.categoria };
  }
  write('entries', all);
  return Object.keys(all).length;
}

// Estante: livros lado a lado. Fase 1: o seu livro + perfis falsos. Só capa e nome (nunca o conteúdo).
// Fase 4: vira fetch() para o Worker (listShelf(groupId) devolve só quem está no grupo).
const CAPA_PADRAO = { m: 'trinco', cor: '#000000', e: 'nenhum', t: 'liso', metal: 'prata', txt: '', np: 'ie', pg: '#f6eedb', gl: 0 };
const PERFIS_FALSOS = [
  { id: 'f1', nome: 'Ana',   cover: { cor: '#7a1f2b', t: 'couro',    metal: 'ouro',   e: 'flor',    txt: 'Ana',             np: 'topo', pg: '#f6eedb' } },
  { id: 'f2', nome: 'Bruno', cover: { cor: '#1f3b5c', t: 'croco',    metal: 'prata',  e: 'bussola', txt: 'Bruno',           np: 'baixo', pg: '#ffffff' } },
  { id: 'f3', nome: 'Carla', cover: { cor: '#2f5d46', t: 'linho',    metal: 'cobre',  e: 'arvore',  txt: 'Diário da Carla', np: 'meio', pg: '#f7e7a1' } },
  { id: 'f4', nome: 'Diego', cover: { cor: '#5a3a22', t: 'madeira',  metal: 'bronze', e: 'moldura', txt: '',                np: 'ie', pg: '#f6eedb' } },
  { id: 'f5', nome: 'Elisa', cover: { cor: '#c9a5b8', t: 'veludo',   metal: 'ouro',   e: 'luas',    txt: 'Elisa',           np: 'topo', pg: '#f6dce0' } },
  { id: 'f6', nome: 'Fábio', cover: { cor: '#222222', t: 'saffiano', metal: 'prata',  e: 'coroa',   txt: '',                np: 'ie', pg: '#e4e4e2' } },
  { id: 'f7', nome: 'Gabi',  cover: { cor: '#d9a441', t: 'camurca',  metal: 'prata' , e: 'solua',   txt: 'Gabi',            np: 'id', pg: '#dbe7f5' } },
];

export async function listShelf(groupId) { // groupId ainda não é usado na Fase 1
  const meu = { id: getUser().id, nome: getUser().nome, voce: true, thumb: read('coverThumb2', null), cover: { ...CAPA_PADRAO, ...(read('cover', null) || {}) } };
  return [meu, ...PERFIS_FALSOS.map((p) => ({ ...p, cover: { ...CAPA_PADRAO, ...p.cover } }))];
}

// Ainda por fazer: getDump(tipo, periodo) no api (hoje o cálculo roda direto nas telas) e shareDump(groupId, mes)
