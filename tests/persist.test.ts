// O que entra no app vindo do navegador ou de um arquivo importado precisa ser validado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, parsePersisted } from '../src/state/persist.ts';

test('lixo vira estado padrão', () => {
  for (const x of [null, undefined, 42, 'oi', [], { v: 2 }, { v: '1' }]) {
    assert.deepEqual(parsePersisted(x), defaultState());
  }
});

test('mantém só ids de subtópico válidos e valor true', () => {
  const p = parsePersisted({ v: 1, done: { 'm1.0': true, 'pC.3': true, 'm1.1': 'sim', __proto__x: true, 'm999.1': true, '<img>': true } });
  assert.deepEqual(Object.keys(p.done).sort(), ['m1.0', 'pC.3']);
});

test('não deixa __proto__ poluir o objeto', () => {
  const p = parsePersisted(JSON.parse('{"v":1,"done":{"__proto__":{"polluted":true}}}'));
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.deepEqual(Object.keys(p.done), []);
});

test('notas: descarta registros inválidos, limita nota e corta textos', () => {
  const p = parsePersisted({
    v: 1,
    grades: [
      { exId: 'ex-1', n: 1, mode: 'Explique', nota: 15, notes: 'x'.repeat(10000), createdAt: '2026-11-18T10:00:00Z', title: 't' },
      { exId: 'javascript:alert(1)', n: 1, mode: 'Explique', nota: 5, createdAt: '2026-11-18T10:00:00Z' },
      { exId: 'ex-1', n: 1, mode: 'Hack', nota: 5, createdAt: '2026-11-18T10:00:00Z' },
      { exId: 'ex-1', n: 1, mode: 'Explique', nota: 5, createdAt: 'ontem' }
    ]
  });
  assert.equal(p.grades.length, 1);
  assert.equal(p.grades[0].nota, 10);
  assert.equal(p.grades[0].notes.length, 4000);
});

test('cronograma: só linhas conhecidas, meses entre 0 e 12, fim nunca antes do início', () => {
  const d = defaultState();
  const id = d.plan[0].id;
  const p = parsePersisted({ v: 1, plan: [{ id, s: 5, e: 2, done: true }, { id: 'inventado', s: 1, e: 2 }, { id: d.plan[1].id, s: -3, e: 99 }] });
  assert.equal(p.plan.length, d.plan.length);
  assert.deepEqual(p.plan[0], { id, s: 5, e: 5, done: true });
  assert.equal(p.plan[1].s, d.plan[1].s);
  assert.equal(p.plan[1].e, d.plan[1].e);
});

test('preferências de tela fora do esperado voltam ao padrão', () => {
  const p = parsePersisted({ v: 1, ui: { trilha: 'x', z: 99, exMode: 'Hack', exLocked: 'sim' } });
  assert.deepEqual(p.ui, defaultState().ui);
});
