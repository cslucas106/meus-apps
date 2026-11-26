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

// Ainda por fazer (etapas 5 a 7 do plano): getDump(tipo, periodo), listShelf(groupId), shareDump(groupId, mes)
