// Cálculo do dump mensal (sem IA nesta fase). Tudo sai de contagem de categorias.
// Regra do mês: se o 1º lugar tem mais de MARGEM dias de vantagem sobre os demais, ele vence.
// Se há empate ou diferença de até MARGEM dia(s), o mês é lido pela soma (média das valências ponderada pelos dias).
export const MARGEM = 1;
export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const AGRIDOCE = { id: 'agridoce', nome: 'Agridoce', emoji: '🌗', cor: '#9a8fb0', valencia: 0 }; // resultado composto, não é um dos 12

export const nomeMes = (mes) => { const [y, m] = mes.split('-').map(Number); return `${MESES[m - 1]} de ${y}`; };

// entradas: [{data, categoria}] do mês; hoje: 'AAAA-MM-DD'. Mês em andamento conta só até hoje.
export function calcMes(entradas, cat, mes, hoje) {
  const [y, m] = mes.split('-').map(Number);
  const diasDoMes = new Date(y, m, 0).getDate();
  const fechado = mes < hoje.slice(0, 7);
  const decorridos = fechado ? diasDoMes : (mes === hoje.slice(0, 7) ? Number(hoje.slice(8, 10)) : 0);
  const cats = Object.fromEntries(cat.categorias.map((c) => [c.id, c]));

  const cont = {};
  for (const e of entradas) cont[e.categoria] = (cont[e.categoria] || 0) + 1;
  const ranking = cat.categorias.map((c) => ({ ...c, n: cont[c.id] || 0 })).filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n); // empate mantém a ordem do catálogo
  const registrados = entradas.length;
  const base = { mes, fechado, decorridos, registrados, brancos: Math.max(0, decorridos - registrados), ranking };
  if (!ranking.length) return { ...base, vazio: true };

  const { vencedor, viaSoma, proximos, media } = decide(ranking, cats);
  return { ...base, vazio: false, vencedor, viaSoma, empatados: proximos, media, texto: montaTexto({ vencedor, viaSoma, proximos, ranking }, mes) };
}

// Quem vence um período (mês ou ano): vantagem de mais de MARGEM dias vence; senão lê pela soma das valências.
function decide(ranking, cats) {
  const lider = ranking[0];
  const proximos = ranking.filter((c) => lider.n - c.n <= MARGEM); // inclui o líder
  let vencedor = lider, viaSoma = false, media = null;
  if (proximos.length > 1) {
    viaSoma = true;
    const total = proximos.reduce((s, c) => s + c.n, 0);
    media = proximos.reduce((s, c) => s + c.valencia * c.n, 0) / total;
    vencedor = media >= 0.5 ? cats.alegria : media <= -0.5 ? cats.tristeza : AGRIDOCE;
  }
  return { vencedor, viaSoma, proximos, media };
}

const minus = (c) => c.nome.toLowerCase();
function montaTexto({ vencedor, viaSoma, proximos, ranking }, mes) {
  const v = Number(mes.slice(5, 7));
  const outros = ranking.filter((c) => c.id !== vencedor.id).slice(0, 2).map(minus);
  const tambem = outros.length ? ` Também apareceram ${outros.join(' e ')}.` : '';
  if (vencedor.id === 'agridoce') {
    const a = proximos.slice(0, 2).map(minus).join(' e ');
    return `Um mês agridoce: ${a} dividiram o espaço e nenhum levou a melhor.`;
  }
  if (viaSoma) {
    const a = proximos.slice(0, 2).map(minus).join(' e ');
    return `Este mês ficou dividido entre ${a}. Somando os dias, ele pendeu para ${minus(vencedor)}.`;
  }
  const modelos = [
    `Este mês foi de muitos sentimentos, o que mais apareceu foi ${minus(vencedor)}.${tambem}`,
    `${vencedor.nome} foi quem mais marcou este mês.${tambem}`,
    `Se este mês tivesse uma palavra, seria ${minus(vencedor)}.${tambem}`,
  ];
  return modelos[v % modelos.length];
}

/* ---------- dump anual ---------- */
export const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const SEMANA_PL = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados'];
const diaNum = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const dow = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).getDay(); };

// entradas: [{data, categoria}] do ano; ano: '2026'; hoje: 'AAAA-MM-DD'
export function calcAno(entradas, cat, ano, hoje) {
  const y = Number(ano), hy = Number(hoje.slice(0, 4));
  const cats = Object.fromEntries(cat.categorias.map((c) => [c.id, c]));
  const fechado = y < hy;
  const diasAno = (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5;
  const decorridos = fechado ? diasAno : y === hy ? diaNum(hoje) - Date.UTC(y, 0, 0) / 864e5 : 0;

  const cont = {};
  for (const e of entradas) cont[e.categoria] = (cont[e.categoria] || 0) + 1;
  const ranking = cat.categorias.map((c) => ({ ...c, n: cont[c.id] || 0 })).filter((c) => c.n > 0).sort((a, b) => b.n - a.n);
  const registrados = entradas.length;
  const base = { ano, fechado, decorridos, registrados, brancos: Math.max(0, decorridos - registrados), ranking };
  if (!ranking.length) return { ...base, vazio: true };
  const { vencedor, viaSoma } = decide(ranking, cats);

  // dia da semana x categoria: a categoria que mais aparece em cada dia da semana
  const semana = SEMANA.map((nome, i) => ({ dow: i, nome, n: 0, cont: {}, soma: 0 }));
  for (const e of entradas) { const s = semana[dow(e.data)]; s.n++; s.cont[e.categoria] = (s.cont[e.categoria] || 0) + 1; s.soma += (cats[e.categoria] || {}).valencia || 0; }
  for (const s of semana) {
    s.media = s.n ? s.soma / s.n : null;
    s.top = s.n ? cat.categorias.map((c) => ({ ...c, n: s.cont[c.id] || 0 })).sort((a, b) => b.n - a.n)[0] : null; // empate: ordem do catálogo
  }
  const cand = semana.filter((s) => s.n >= 2).length >= 2 ? semana.filter((s) => s.n >= 2) : semana.filter((s) => s.n >= 1);
  const leve = [...cand].sort((a, b) => b.media - a.media || b.n - a.n)[0];
  const pesado = [...cand].sort((a, b) => a.media - b.media || b.n - a.n)[0];
  const textoSemana = (leve && pesado && leve.dow !== pesado.dow && leve.media !== pesado.media)
    ? `Nas ${SEMANA_PL[leve.dow]} você se sentiu mais ${minus(leve.top)}, nas ${SEMANA_PL[pesado.dow]} mais ${minus(pesado.top)}.`
    : `Nas ${SEMANA_PL[leve.dow]} você se sentiu mais ${minus(leve.top)}.`;

  // mês mais intenso: maior média de |valência| (meses com 5+ registros, se houver)
  const porMes = {};
  for (const e of entradas) (porMes[e.data.slice(0, 7)] ||= []).push(e);
  let meses = Object.entries(porMes).map(([mes, l]) => ({ mes, l, n: l.length, forca: l.reduce((s, e) => s + Math.abs((cats[e.categoria] || {}).valencia || 0), 0) / l.length }));
  if (meses.some((m) => m.n >= 5)) meses = meses.filter((m) => m.n >= 5);
  meses.sort((a, b) => b.forca - a.forca || b.n - a.n);
  const mi = meses[0];
  const mesIntenso = mi ? { mes: mi.mes, nome: MESES[Number(mi.mes.slice(5, 7)) - 1], n: mi.n, vencedor: calcMes(mi.l, cat, mi.mes, hoje).vencedor } : null;

  // maior sequência de dias seguidos com registro
  const dias = [...new Set(entradas.map((e) => e.data))].sort();
  let melhor = { n: 0, fim: null }, atual = 0;
  dias.forEach((d, i) => { atual = i && diaNum(d) - diaNum(dias[i - 1]) === 1 ? atual + 1 : 1; if (atual > melhor.n) melhor = { n: atual, fim: d }; });

  return { ...base, vazio: false, vencedor, viaSoma, semana, textoSemana, mesIntenso, sequencia: melhor };
}
