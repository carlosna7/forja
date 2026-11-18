export const pad2 = (i: number) => String(i).padStart(2, '0');
export const fmtN = (x: number) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
export const clamp10 = (x: unknown) => Math.max(0, Math.min(10, Number(x) || 0));
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
};
/** Índice do mês no cronograma: dez/2026 = 0, dez/2027 = 12. */
export const monthIdx = (d = new Date()) => (d.getFullYear() - 2026) * 12 + d.getMonth() - 11;
export const fmtT = (s: number) => `${pad2(Math.floor(s / 60))}:${pad2(Math.floor(s % 60))}`;
export const fmtMin = (m: number) => (m >= 60 ? `${Math.round(m / 60)} h` : `${m} min`);
