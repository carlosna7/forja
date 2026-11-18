// Conteúdo da trilha (tipado) e estruturas derivadas que não dependem do progresso.
// O conteúdo em si mora em content.json; ver docs/conteudo.md para editar.
import raw from './content.json' with { type: 'json' };

export type ResKind = 'artigo' | 'video' | 'livro' | 'referencia' | 'curso' | 'pratica';
export type Resource = [ResKind, string, string?];
/** Item de checklist: texto simples, "#Grupo", "!texto" (você já usa) ou [texto, etiqueta | nº do tópico]. */
export type TopicEntry = string | [string, string | number];
export type Mode = 'Na mão' | 'Explique' | 'Revise a IA' | 'Projeto';

export interface Module {
  t: string; s: string; why: string; top: string[]; res: Resource[]; tip?: string;
  g: string; lc: [number, string, string][]; ex: string; pj: string;
}
export interface Line { id: number; name: string; note: string; mods: number[] }
export interface Parallel { k: string; t: string; why: string; g: string; top: TopicEntry[]; res: Resource[] }
export interface PosCourse { inst: string; t: string; url: string; ia: number; arq: number; rows: [string, string][] }
export interface PlanDefault { id: string; label: string; note: string; s: number; e: number; url?: string; dashed?: boolean }
export type Edge = [number, number] | [number, number, number];

interface Content { LINES: Line[]; M: Record<string, Module>; PAR: Parallel[]; EDGES: Edge[]; POS: PosCourse[]; PLAN: PlanDefault[] }
const data = raw as unknown as Content;

export const LINES = data.LINES;
export const M: Record<number, Module> = Object.fromEntries(Object.entries(data.M).map(([k, v]) => [Number(k), v]));
export const PAR = data.PAR;
export const EDGES = data.EDGES;
export const POS = data.POS;
export const PLAN_DEFAULT = data.PLAN;

export const ORDER: number[] = LINES.flatMap((l) => l.mods);
export const LINE_OF: Record<number, Line> = {};
LINES.forEach((l) => l.mods.forEach((n) => (LINE_OF[n] = l)));
export const LSHORT = ['Fundamentos', 'Bom código', 'Backend', 'Concorrência', 'Distribuídos', 'Produção', 'Síntese'];

export const MONTHS = ['dez/26', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez/27'];
export const RLBL: Record<ResKind, string> = { artigo: 'Artigo', video: 'Vídeo', livro: 'Livro', referencia: 'Referência', curso: 'Curso', pratica: 'Prática' };
export const MODES: Mode[] = ['Na mão', 'Explique', 'Revise a IA', 'Projeto'];
export const CRIT: Record<Mode, string[]> = {
  'Na mão': ['Correção', 'Complexidade', 'Casos de borda', 'Clareza'],
  'Explique': ['Precisão', 'Profundidade', 'Exemplos', 'Clareza'],
  'Revise a IA': ['Bugs encontrados', 'Causa explicada', 'Correção proposta', 'Clareza'],
  'Projeto': ['Correção', 'Arquitetura', 'Casos de borda', 'Testes', 'Clareza']
};
/** Modo sugerido por dia da semana (domingo = 0). */
export const MODE_DAY: Mode[] = ['Explique', 'Na mão', 'Revise a IA', 'Na mão', 'Explique', 'Na mão', 'Projeto'];

/** Ids dos itens marcáveis de cada lista ("m20" → ["m20.0", ...]). Grupos (#) não contam. */
export const ITEMS: Record<string, string[]> = {};
function buildItems(key: string, top: TopicEntry[]) {
  const ids: string[] = [];
  let i = 0;
  top.forEach((x) => {
    const s = Array.isArray(x) ? x[0] : x;
    if (s.startsWith('#')) return;
    ids.push(`${key}.${i++}`);
  });
  ITEMS[key] = ids;
}
ORDER.forEach((n) => buildItems(`m${n}`, M[n].top));
PAR.forEach((p) => buildItems(`p${p.k}`, p.top));
export const TOTAL = ORDER.reduce((a, n) => a + ITEMS[`m${n}`].length, 0);

export const hardDeps = (n: number) => EDGES.filter((e) => e[1] === n && !e[2]).map((e) => e[0]);
export const softDeps = (n: number) => EDGES.filter((e) => e[1] === n && !!e[2]).map((e) => e[0]);
export const children = (n: number) => EDGES.filter((e) => e[0] === n).map((e) => ({ n: e[1], soft: !!e[2] }));
