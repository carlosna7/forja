// Regras de progresso e bloqueio. Funções puras: recebem o estado salvo e devolvem números.
import { ITEMS, LINES, LINE_OF, ORDER, TOTAL, hardDeps, type Line } from '../data';
import { dayKey } from '../lib/format';
import type { Persisted } from '../state/persist';

export type Status = 'lock' | 'open' | 'doing' | 'done';
export const STATUS_LABEL: Record<Status, string> = { lock: 'bloqueado', open: 'liberado', doing: 'em andamento', done: 'concluído' };

export function stat(p: Persisted, key: string) {
  const ids = ITEMS[key] ?? [];
  const d = ids.filter((id) => p.done[id]).length;
  return { d, t: ids.length, p: ids.length ? Math.round((d / ids.length) * 100) : 0 };
}
export const projectApproved = (p: Persisted, n: number) => p.grades.some((g) => g.n === n && g.mode === 'Projeto' && g.nota >= 7);

/** Concluído: todos os subtópicos marcados (e, se a opção estiver ligada, um projeto com nota 7+). */
export function complete(p: Persisted, n: number) {
  const s = stat(p, `m${n}`);
  return s.t > 0 && s.d === s.t && (!p.requireProject || projectApproved(p, n));
}
/** Liberado: todas as dependências obrigatórias concluídas. Recomendadas não bloqueiam. */
export const unlocked = (p: Persisted, n: number) => hardDeps(n).every((d) => complete(p, d));
export function status(p: Persisted, n: number): Status {
  if (!unlocked(p, n)) return 'lock';
  if (complete(p, n)) return 'done';
  return stat(p, `m${n}`).d > 0 ? 'doing' : 'open';
}

export function lineStat(p: Persisted, l: Line) {
  let d = 0, t = 0;
  l.mods.forEach((n) => { const s = stat(p, `m${n}`); d += s.d; t += s.t; });
  return { d, t, p: t ? Math.round((d / t) * 100) : 0 };
}
export function overall(p: Persisted) {
  const d = ORDER.reduce((a, n) => a + stat(p, `m${n}`).d, 0);
  return { d, t: TOTAL, p: Math.round((d / TOTAL) * 100), mods: ORDER.filter((n) => complete(p, n)).length };
}
export function streak(p: Persisted) {
  let c = 0;
  const d = new Date();
  if (!p.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (p.days[dayKey(d)]) { c++; d.setDate(d.getDate() - 1); }
  return c;
}
export function missingFor(p: Persisted, n: number) {
  return hardDeps(n).filter((d) => !complete(p, d)).map((d) => {
    const s = stat(p, `m${d}`);
    return { n: d, left: s.t - s.d, needProject: p.requireProject && !projectApproved(p, d) };
  });
}
/** O tópico bloqueado mais perto de liberar (menos subtópicos faltando nas dependências). */
export function nextUnlock(p: Persisted): number | null {
  let best: number | null = null, bestLeft = Infinity;
  ORDER.forEach((n) => {
    if (unlocked(p, n)) return;
    const miss = missingFor(p, n);
    const left = miss.reduce((a, m) => a + m.left, 0) + miss.filter((m) => m.needProject).length * 3;
    if (left < bestLeft) { bestLeft = left; best = n; }
  });
  return best;
}
export function currentLine(p: Persisted): Line {
  const n = ORDER.find((x) => status(p, x) === 'doing') ?? ORDER.find((x) => status(p, x) === 'open') ?? 30;
  return LINE_OF[n] ?? LINES[LINES.length - 1];
}
