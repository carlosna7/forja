// Histórico de notas registradas, com médias por modo.
import { M, MODES } from '../data';
import { fmtDate, fmtN } from '../lib/format';
import { GradeCard, Mono, PageHead } from '../components/ui';
import { useStore } from '../state/store';

export function Avaliacoes() {
  const { p, removeGrade } = useStore();
  const list = p.grades.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!list.length) {
    return (
      <>
        <PageHead eyebrow="Notas registradas" title="Avaliações" />
        <div className="frame">
          <span className="eyb">Nenhuma nota ainda</span>
          <p className="muted" style={{ maxWidth: '62ch' }}>Cada exercício avaliado pelo Claude vira um registro aqui, com a nota e o parecer. Comece pelo recomendado de hoje.</p>
          <div className="row"><a className="btn solid" href="#hoje">Ver o exercício de hoje</a></div>
        </div>
      </>
    );
  }
  const ok = list.filter((g) => g.nota >= 7).length, avg = list.reduce((a, g) => a + g.nota, 0) / list.length;
  return (
    <>
      <PageHead eyebrow={`${list.length} registro${list.length > 1 ? 's' : ''}`} title="Avaliações" />
      <div className="frame">
        <div className="stats">
          <div><span className="eyb">Média geral</span><b>{fmtN(avg)}</b></div>
          <div><span className="eyb">Aprovados</span><b>{ok}/{list.length}</b></div>
          {MODES.map((md) => {
            const l = list.filter((g) => g.mode === md);
            return l.length ? <div key={md}><span className="eyb">{md}</span><b>{fmtN(l.reduce((a, g) => a + g.nota, 0) / l.length)}</b></div> : null;
          })}
        </div>
      </div>
      <div>
        {list.map((g) => (
          <details key={g.id} className="sub">
            <summary>
              <span className={`nota ${g.nota >= 7 ? 'ok' : 'bad'}`}>{fmtN(g.nota)}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{g.title}</span><br />
                <Mono>U{g.n} {M[g.n]?.s ?? ''} · {g.mode}</Mono>
              </span>
              <Mono size={11}>{fmtDate(g.createdAt)}</Mono>
            </summary>
            <div className="body">
              <GradeCard g={g} />
              <div className="row">
                <a className="btn sm" href={`#x-${g.exId}`}>Abrir exercício</a>
                <button type="button" className="linkbtn" onClick={() => removeGrade(g.id)}>Apagar registro</button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
