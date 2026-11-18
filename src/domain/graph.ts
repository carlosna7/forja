// Layout do esquema de ligações: uma coluna por linha da trilha, uma fileira por tópico.
// As ligações saem pela direita do bloco e andam em ângulo reto pelos vãos entre colunas
// e entre fileiras, para nunca atravessar um bloco.
import { EDGES, LINES } from '../data';

export const G = { BW: 196, BH: 40, CG: 104, RH: 64, TOP: 44, L: 8 };
export const gx = (c: number) => G.L + c * (G.BW + G.CG);
export const gy = (r: number) => G.TOP + r * G.RH;
export const GPOS: Record<number, { c: number; r: number }> = {};
LINES.forEach((l, c) => l.mods.forEach((n, r) => (GPOS[n] = { c, r })));
export const GW = gx(LINES.length) - G.CG + 40;
export const GH = gy(Math.max(...LINES.map((l) => l.mods.length))) + 16;

export interface EdgePath { a: number; b: number; soft: boolean; d: string }

function buildPaths(): EdgePath[] {
  const slots: Record<number, number> = {};
  // Cada ligação ganha uma faixa própria no vão depois da coluna, para não se sobreporem.
  const take = (c: number) => { slots[c] = (slots[c] ?? 0) + 1; return 14 + ((slots[c] - 1) % 11) * 7; };
  return EDGES.map(([a, b, soft]) => {
    const A = GPOS[a], B = GPOS[b];
    const sx = gx(A.c) + G.BW, sy = gy(A.r) + G.BH / 2, ty = gy(B.r) + G.BH / 2;
    let d: string;
    if (A.c === B.c) {
      const x = sx + take(A.c);
      d = `M${sx} ${sy}H${x}V${ty}H${sx + 4}`;
    } else if (B.c === A.c + 1) {
      const x = sx + take(A.c);
      d = `M${sx} ${sy}H${x}V${ty}H${gx(B.c) - 4}`;
    } else {
      const x1 = sx + take(A.c), x2 = gx(B.c) - take(B.c - 1);
      const yc = gy(B.r) - 12 + ((slots[A.c] % 3) - 1) * 3; // corredor entre fileiras
      d = `M${sx} ${sy}H${x1}V${yc}H${x2}V${ty}H${gx(B.c) - 4}`;
    }
    return { a, b, soft: !!soft, d };
  });
}
export const EDGE_PATHS = buildPaths();

/** Todos os tópicos acima (fwd = false) ou abaixo (fwd = true) de `start` no grafo. */
export function walk(start: number, fwd: boolean): Set<number> {
  const out = new Set<number>(), stack = [start];
  while (stack.length) {
    const c = stack.pop()!;
    EDGES.forEach(([a, b]) => {
      const from = fwd ? a : b, to = fwd ? b : a;
      if (from === c && !out.has(to)) { out.add(to); stack.push(to); }
    });
  }
  return out;
}
