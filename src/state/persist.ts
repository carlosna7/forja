// Formato do que fica salvo no navegador, valores padrão e validação.
// Tudo que vem do localStorage ou de um arquivo importado passa por parsePersisted:
// chaves e tipos fora do esperado são descartados, textos são cortados e números limitados.
import { MODES, PLAN_DEFAULT, type Mode } from '../data';
import { clamp10 } from '../lib/format';

export interface Grade { id: string; exId: string; n: number; mode: Mode; title: string; nota: number; notes: string; createdAt: string }
export interface PlanRow { id: string; s: number; e: number; done: boolean }
export interface UIPrefs { trilha: 'esquema' | 'colunas'; z: number; exMode: 'Todos' | Mode; exLocked: boolean }
export interface Persisted {
  v: 1;
  done: Record<string, true>;
  days: Record<string, true>;
  plan: PlanRow[];
  requireProject: boolean;
  grades: Grade[];
  ui: UIPrefs;
}

export const STORAGE_KEY = 'forja:v1';
const ITEM_RE = /^(m\d{1,2}|p[A-Z])\.\d{1,3}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const EX_RE = /^(lc-\d{1,2}-\d{1,5}|ex-\d{1,2}|rv-\d{1,2}|pj-\d{1,2})$/;
const MAX_GRADES = 2000;

export function defaultState(): Persisted {
  return {
    v: 1, done: {}, days: {}, requireProject: false, grades: [],
    plan: PLAN_DEFAULT.map((r) => ({ id: r.id, s: r.s, e: r.e, done: false })),
    ui: { trilha: 'esquema', z: 1, exMode: 'Todos', exLocked: false }
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x: unknown, max: number) => (typeof x === 'string' ? x.slice(0, max) : '');
const int = (x: unknown, lo: number, hi: number, d: number) => (Number.isInteger(x) && (x as number) >= lo && (x as number) <= hi ? (x as number) : d);

function keySet(x: unknown, re: RegExp): Record<string, true> {
  const out: Record<string, true> = {};
  if (!isObj(x)) return out;
  for (const k of Object.keys(x)) if (re.test(k) && x[k] === true) out[k] = true;
  return out;
}

export function parsePersisted(x: unknown): Persisted {
  const d = defaultState();
  if (!isObj(x) || x.v !== 1) return d;
  const planIn = Array.isArray(x.plan) ? x.plan : [];
  const plan = d.plan.map((row) => {
    const r = planIn.find((p): p is Record<string, unknown> => isObj(p) && p.id === row.id);
    if (!r) return row;
    let s = int(r.s, 0, 12, row.s), e = int(r.e, 0, 12, row.e);
    if (e < s) e = s;
    return { id: row.id, s, e, done: r.done === true };
  });
  const grades: Grade[] = (Array.isArray(x.grades) ? x.grades : []).slice(0, MAX_GRADES).flatMap((g): Grade[] => {
    if (!isObj(g)) return [];
    const exId = str(g.exId, 24), mode = g.mode as Mode, n = int(g.n, 1, 30, 0), created = str(g.createdAt, 40);
    if (!EX_RE.test(exId) || !MODES.includes(mode) || !n || Number.isNaN(Date.parse(created))) return [];
    return [{ id: str(g.id, 40) || `g-${Date.parse(created)}`, exId, n, mode, title: str(g.title, 300), nota: Math.round(clamp10(g.nota) * 10) / 10, notes: str(g.notes, 4000), createdAt: created }];
  });
  const ui = isObj(x.ui) ? x.ui : {};
  return {
    v: 1,
    done: keySet(x.done, ITEM_RE),
    days: keySet(x.days, DAY_RE),
    plan,
    requireProject: x.requireProject === true,
    grades,
    ui: {
      trilha: ui.trilha === 'colunas' ? 'colunas' : 'esquema',
      z: typeof ui.z === 'number' && ui.z >= 0.4 && ui.z <= 1.6 ? Math.round(ui.z * 10) / 10 : 1,
      exMode: MODES.includes(ui.exMode as Mode) ? (ui.exMode as Mode) : 'Todos',
      exLocked: ui.exLocked === true
    }
  };
}

export function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parsePersisted(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}
