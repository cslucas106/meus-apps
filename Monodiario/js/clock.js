// Fase 1: relógio do aparelho (+ ?hoje=AAAA-MM-DD para testes).
// Fase 2: o Worker devolve a data oficial; o relógio do celular nunca decide a trava.
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const override = new URLSearchParams(location.search).get('hoje');

export function today(tz) {
  if (override && ISO.test(override)) return override;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || undefined, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const monthKey = (iso) => iso.slice(0, 7);

export function formatLong(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}
