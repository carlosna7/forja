// Estado global: um único objeto salvo no localStorage, exposto por contexto com ações nomeadas.
// Abas abertas ao mesmo tempo ficam em sincronia pelo evento `storage`.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dayKey } from '../lib/format';
import { defaultState, loadPersisted, parsePersisted, STORAGE_KEY, type Grade, type Persisted, type PlanRow, type UIPrefs } from './persist';

export type SaveStatus = 'local' | 'error';

interface Store {
  p: Persisted;
  saveStatus: SaveStatus;
  toggleItem: (id: string, on: boolean) => void;
  setRequireProject: (on: boolean) => void;
  setPlan: (i: number, patch: Partial<Omit<PlanRow, 'id'>>) => void;
  addGrade: (g: Omit<Grade, 'id' | 'createdAt'>) => void;
  removeGrade: (id: string) => void;
  setUI: (patch: Partial<UIPrefs>) => void;
  importState: (raw: unknown) => { ok: boolean; message: string };
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

function newId() {
  try { return crypto.randomUUID(); } catch { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Persisted>(loadPersisted);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('local');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); setSaveStatus('local'); } catch { setSaveStatus('error'); }
  }, [p]);

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== STORAGE_KEY || !ev.newValue) return;
      try { setP(parsePersisted(JSON.parse(ev.newValue))); } catch { /* valor inválido de outra aba: ignora */ }
    };
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, []);

  const toggleItem = useCallback((id: string, on: boolean) => setP((s) => {
    const done = { ...s.done };
    if (on) done[id] = true; else delete done[id];
    return { ...s, done, days: on ? { ...s.days, [dayKey()]: true } : s.days };
  }), []);

  const setRequireProject = useCallback((on: boolean) => setP((s) => ({ ...s, requireProject: on })), []);

  const setPlan = useCallback((i: number, patch: Partial<Omit<PlanRow, 'id'>>) => setP((s) => {
    const plan = s.plan.slice(), r = { ...plan[i], ...patch };
    if (r.e < r.s) { if ('s' in patch) r.e = r.s; else r.s = r.e; }
    plan[i] = r;
    return { ...s, plan };
  }), []);

  const addGrade = useCallback((g: Omit<Grade, 'id' | 'createdAt'>) => setP((s) => ({
    ...s,
    grades: [{ ...g, id: newId(), createdAt: new Date().toISOString() }, ...s.grades].slice(0, 2000),
    days: { ...s.days, [dayKey()]: true }
  })), []);

  const removeGrade = useCallback((id: string) => setP((s) => ({ ...s, grades: s.grades.filter((g) => g.id !== id) })), []);
  const setUI = useCallback((patch: Partial<UIPrefs>) => setP((s) => ({ ...s, ui: { ...s.ui, ...patch } })), []);

  const importState = useCallback((raw: unknown) => {
    const next = parsePersisted(raw);
    const looksEmpty = !Object.keys(next.done).length && !next.grades.length;
    if (looksEmpty && !(raw && typeof raw === 'object' && (raw as { v?: unknown }).v === 1)) {
      return { ok: false, message: 'Esse arquivo não parece um progresso exportado da Forja.' };
    }
    setP(next);
    return { ok: true, message: `Progresso importado: ${Object.keys(next.done).length} subtópicos e ${next.grades.length} avaliações.` };
  }, []);

  const resetAll = useCallback(() => setP(defaultState()), []);

  const value = useMemo<Store>(() => ({ p, saveStatus, toggleItem, setRequireProject, setPlan, addGrade, removeGrade, setUI, importState, resetAll }),
    [p, saveStatus, toggleItem, setRequireProject, setPlan, addGrade, removeGrade, setUI, importState, resetAll]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore precisa estar dentro de <StoreProvider>');
  return s;
}
