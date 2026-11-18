// Regras de bloqueio, conclusão e recomendação.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EDGES, ITEMS, LINES, ORDER, hardDeps } from '../src/data/index.ts';
import { complete, status, unlocked } from '../src/domain/progress.ts';
import { recommend, EXI, exList } from '../src/domain/exercises.ts';
import { defaultState, type Persisted } from '../src/state/persist.ts';

const finish = (p: Persisted, n: number): Persisted => {
  const done = { ...p.done };
  ITEMS[`m${n}`].forEach((id) => (done[id] = true));
  return { ...p, done };
};

test('conteúdo: 30 tópicos, ligações apontam para tópicos existentes e sem ciclos', () => {
  assert.equal(ORDER.length, 30);
  assert.equal(new Set(ORDER).size, 30);
  const seen = new Set<number>();
  for (const n of ORDER) {
    for (const d of hardDeps(n)) assert.ok(seen.has(d) || LINES.findIndex((l) => l.mods.includes(d)) <= LINES.findIndex((l) => l.mods.includes(n)), `U${d} -> U${n} aponta para trás`);
    seen.add(n);
  }
  for (const [a, b] of EDGES) assert.ok(ORDER.includes(a) && ORDER.includes(b));
});

test('raízes começam liberadas; o resto começa bloqueado', () => {
  const p = defaultState();
  for (const n of ORDER) assert.equal(unlocked(p, n), hardDeps(n).length === 0, `U${n}`);
});

test('marcar todos os subtópicos conclui e libera os dependentes', () => {
  let p = defaultState();
  const target = ORDER.find((n) => hardDeps(n).length > 0)!;
  assert.equal(status(p, target), 'lock');
  for (const d of hardDeps(target)) p = finish(p, d);
  assert.notEqual(status(p, target), 'lock');
});

test('com "exigir projeto", só conclui com projeto nota 7+', () => {
  let p = finish({ ...defaultState(), requireProject: true }, 1);
  assert.equal(complete(p, 1), false);
  p = { ...p, grades: [{ id: 'a', exId: 'pj-1', n: 1, mode: 'Projeto', title: '', nota: 6.9, notes: '', createdAt: '2026-11-18T10:00:00Z' }] };
  assert.equal(complete(p, 1), false);
  p = { ...p, grades: [{ ...p.grades[0], nota: 7 }] };
  assert.equal(complete(p, 1), true);
});

test('recomendação ignora bloqueados e exercícios já aprovados', () => {
  const p = defaultState();
  const recs = recommend(p);
  assert.ok(recs.length > 0);
  for (const r of recs) assert.notEqual(status(p, r.e.n), 'lock');
  const first = recs[0].e;
  const p2 = { ...p, grades: [{ id: 'a', exId: first.id, n: first.n, mode: first.mode, title: '', nota: 9, notes: '', createdAt: new Date().toISOString() }] };
  assert.ok(!recommend(p2).some((r) => r.e.id === first.id));
});

test('ids de exercício são únicos e batem com o formato validado', () => {
  const ids = ORDER.flatMap((n) => exList(n).map((e) => e.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^(lc-\d{1,2}-\d{1,5}|ex-\d{1,2}|rv-\d{1,2}|pj-\d{1,2})$/);
  assert.equal(Object.keys(EXI).length, ids.length);
});
