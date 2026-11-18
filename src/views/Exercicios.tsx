// Lista de exercícios com filtro por modo e os três recomendados do momento.
import { M, MODES, type Mode } from '../data';
import { ALL_EXERCISES, recommend } from '../domain/exercises';
import { status } from '../domain/progress';
import { GradeBadge, Mono, PageHead } from '../components/ui';
import { useStore } from '../state/store';

export function Exercicios() {
  const { p, setUI } = useStore();
  const { exMode, exLocked } = p.ui;
  const list = ALL_EXERCISES.filter((e) => (exMode === 'Todos' || e.mode === exMode) && (exLocked || status(p, e.n) !== 'lock'));
  const recs = recommend(p).slice(0, 3);
  const filters: ('Todos' | Mode)[] = ['Todos', ...MODES];

  return (
    <>
      <PageHead eyebrow={`${list.length} exercícios${exLocked ? '' : ' liberados'}`} title="Exercícios" />
      {recs.length > 0 && (
        <div className="frame">
          <span className="eyb">Recomendados agora</span>
          <div className="cards">
            {recs.map((r) => (
              <a key={r.e.id} className="card" href={`#x-${r.e.id}`}>
                <span className="mode">{r.e.mode}</span>
                <span className="t">{r.e.title}</span>
                <span className="hint" style={{ fontSize: 12.5 }}>{r.why}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" role="group" aria-label="Filtrar por modo">
          {filters.map((md) => (
            <button key={md} type="button" className="chipf" aria-pressed={exMode === md} onClick={() => setUI({ exMode: md })}>{md}</button>
          ))}
        </div>
        <label className="switch">
          <input type="checkbox" checked={exLocked} onChange={(e) => setUI({ exLocked: e.target.checked })} />Mostrar bloqueados
        </label>
      </div>
      {list.length ? (
        <div className="cards">
          {list.map((e) => {
            const lk = status(p, e.n) === 'lock';
            return (
              <a key={e.id} className={`card${lk ? ' lk' : ''}`} href={`#x-${e.id}`}>
                <span className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="mode">{e.mode}</span>{lk ? <span className="badge">bloqueado</span> : <GradeBadge e={e} />}
                </span>
                <span className="t">{e.title}</span>
                <Mono>U{e.n} {M[e.n].s}</Mono>
              </a>
            );
          })}
        </div>
      ) : <div className="note">Nenhum exercício com esse filtro. Marque subtópicos na trilha para liberar mais tópicos.</div>}
    </>
  );
}
