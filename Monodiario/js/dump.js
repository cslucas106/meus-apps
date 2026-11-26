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

  const lider = ranking[0];
  const proximos = ranking.filter((c) => lider.n - c.n <= MARGEM); // inclui o líder
  let vencedor = lider, viaSoma = false, media = null;
  if (proximos.length > 1) {
    viaSoma = true;
    const total = proximos.reduce((s, c) => s + c.n, 0);
    media = proximos.reduce((s, c) => s + c.valencia * c.n, 0) / total;
    vencedor = media >= 0.5 ? cats.alegria : media <= -0.5 ? cats.tristeza : AGRIDOCE;
  }
  return { ...base, vazio: false, vencedor, viaSoma, empatados: proximos, media, texto: montaTexto({ vencedor, viaSoma, proximos, ranking }, mes) };
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
