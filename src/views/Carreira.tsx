// C1 (cronograma editável) + C2 (cards de pós) + linha paralela de cursos e certificações.
import { useState } from 'react';
import { MONTHS, PAR, PLAN_DEFAULT, POS } from '../data';
import { stat } from '../domain/progress';
import { monthIdx } from '../lib/format';
import { Checklist, Icon, Mono, PageHead, Resources, safeUrl } from '../components/ui';
import { useStore } from '../state/store';

const Pips = ({ k, label }: { k: number; label: string }) => (
  <div className="pips" role="img" aria-label={`${label}: ${k} de 5`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= k ? 'on' : ''} />)}</div>
);

function Gantt() {
  const { p, setPlan } = useStore();
  const [edit, setEdit] = useState(false);
  const now = monthIdx();
  return (
    <div className="frame">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="eyb">Cronograma · proposta de dez/2026 a dez/2027</span>
        <button className="btn sm" type="button" onClick={() => setEdit(!edit)} aria-pressed={edit}>{edit ? 'Pronto' : 'Editar datas'}</button>
      </div>
      <div className="gantt">
        <div className="gt">
          <span />
          {MONTHS.map((m, i) => <span key={m} className={`m${i === now ? ' now' : ''}`}>{m}</span>)}
          {p.plan.map((r, i) => {
            const d = PLAN_DEFAULT.find((x) => x.id === r.id)!;
            const cur = !r.done && now >= r.s && now <= r.e;
            const cls = `bar${r.done ? ' ok' : cur ? ' cur' : ''}${d.dashed && !r.done ? ' ds' : ''}`;
            const style = { gridColumn: `${r.s + 2}/${r.e + 3}` };
            const label = `${r.done ? '✓ ' : ''}${d.note}`;
            const href = safeUrl(d.url);
            return (
              <div key={r.id} style={{ display: 'contents' }}>
                <span className="r" style={{ gridColumn: 1 }}>{d.label}</span>
                {href ? <a className={cls} href={href} target="_blank" rel="noopener noreferrer" style={style}>{label}</a> : <div className={cls} style={style}>{label}</div>}
                {edit && (
                  <>
                    <span style={{ gridColumn: 1 }} />
                    <div className="ed2">
                      <label>Início <select value={r.s} onChange={(e) => setPlan(i, { s: Number(e.target.value) })}>{MONTHS.map((m, j) => <option key={m} value={j}>{m}</option>)}</select></label>
                      <label>Fim <select value={r.e} onChange={(e) => setPlan(i, { e: Number(e.target.value) })}>{MONTHS.map((m, j) => <option key={m} value={j}>{m}</option>)}</select></label>
                      <label className="switch"><input type="checkbox" checked={r.done} onChange={(e) => setPlan(i, { done: e.target.checked })} />Concluído</label>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="hint">A barra fica laranja no mês em que você deveria estar nela. Clique numa barra para abrir o curso.</p>
    </div>
  );
}

export function Carreira() {
  const { p } = useStore();
  return (
    <>
      <PageHead eyebrow="Cursos, certificações e pós" title="Carreira" />
      <Gantt />
      <div className="frame">
        <span className="eyb">Comparativo de pós · dados pesquisados em 18/11/2026</span>
        <div className="g12">
          {POS.map((c) => (
            <section key={c.t} className="sheet c3 pos">
              <span className="eyb">{c.inst}</span>
              <a href={safeUrl(c.url)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'none', fontStretch: '125%', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>{c.t} ↗</a>
              <div>{c.rows.map(([k, v]) => <div key={k} className="rw"><span>{k}</span><span>{v}</span></div>)}</div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontSize: 13 }}>IA aplicada</span><Pips k={c.ia} label="IA aplicada" /></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontSize: 13 }}>Arquitetura</span><Pips k={c.arq} label="Arquitetura" /></div>
              <Mono size={10} color="var(--dash)">medidores: leitura do Claude</Mono>
            </section>
          ))}
        </div>
        <p className="hint">Confira a grade completa e o reconhecimento antes de se matricular. Valores e datas mudam.</p>
      </div>
      <div className="frame">
        <span className="eyb">Linha paralela · do primeiro dia até o fim</span>
        <div className="g12">
          {PAR.map((x) => {
            const s = stat(p, `p${x.k}`);
            return (
              <section key={x.k} className="sheet c4">
                <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <span style={{ color: 'var(--ink)' }}><Icon g={x.g} size={40} /></span>
                    <h3 style={{ fontSize: 17 }}>{x.t}</h3>
                  </div>
                  <Mono size={11} color="var(--ink)">{s.d}/{s.t}</Mono>
                </div>
                <p className="hint">{x.why}</p>
                <Checklist k={`p${x.k}`} top={x.top} />
                {x.res.length > 0 && <div><Resources res={x.res} /></div>}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
