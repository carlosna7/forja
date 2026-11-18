// P1: prancha do tópico, com ícone, motivo, dependências, checklist, exercícios e materiais.
import { LINE_OF, M, children, hardDeps, softDeps } from '../data';
import { exList } from '../domain/exercises';
import { missingFor, projectApproved, stat, status, STATUS_LABEL } from '../domain/progress';
import { fmtMin } from '../lib/format';
import { Blk, Checklist, GradeBadge, Icon, Mono, PageHead, Resources, Rule } from '../components/ui';
import { useStore } from '../state/store';

export function Topico({ n }: { n: number }) {
  const { p } = useStore();
  const m = M[n], l = LINE_OF[n], st = status(p, n), s = stat(p, `m${n}`), locked = st === 'lock';
  const hd = hardDeps(n), sd = softDeps(n), ch = children(n), miss = missingFor(p, n);

  return (
    <>
      <PageHead eyebrow={`Prancha U${n} · Linha ${l.id} · ${l.name}`} title={m.t} crumb={{ href: '#trilha', label: '← Trilha' }} />
      <div className="frame">
        <div className="g12">
          <div className="col c4">
            <div style={{ color: 'var(--ink)' }}><Icon g={m.g} size={104} label={m.t} /></div>
            <p style={{ fontSize: 16, lineHeight: 1.55 }} className="muted">{m.why}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontSize: 11 }}>{s.d}/{s.t} subtópicos · {STATUS_LABEL[st]}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--pencil)' }}>{s.p}%</span>
              </div>
              <Rule p={s.p} o />
            </div>
            {p.requireProject && s.d === s.t && !projectApproved(p, n) && (
              <p className="err">Todos os subtópicos marcados. Falta um projeto aprovado com nota 7 ou mais.</p>
            )}
            {locked && (
              <div className="lockbox">
                <b>Bloqueado</b>
                <span>
                  Conclua antes:{' '}
                  {miss.map((x, i) => (
                    <span key={x.n}>{i > 0 && ', '}<a href={`#t-${x.n}`}>U{x.n} {M[x.n].s}</a> (faltam {x.left}{x.needProject ? ' e o projeto' : ''})</span>
                  ))}. Você pode ler tudo, mas marcar e registrar notas só depois.
                </span>
              </div>
            )}
            <div className="bus">
              {hd.length || sd.length ? (
                <>
                  <span className="eyb">Base</span>
                  {hd.map((d) => <Blk key={d} n={d} />)}
                  {sd.map((d) => <Blk key={d} n={d} note="recomendado" />)}
                </>
              ) : <span className="eyb">Raiz: não exige nada</span>}
              <span className="eyb">Você está aqui</span>
              <Blk n={n} here />
              {ch.length > 0 && <><span className="eyb">Libera ao concluir</span>{ch.map((c) => <Blk key={c.n} n={c.n} />)}</>}
            </div>
          </div>

          <section className="sheet c4">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="eyb">Detalhes, em ordem</span>
              <Mono size={11}>{s.d}/{s.t}</Mono>
            </div>
            <Checklist k={`m${n}`} top={m.top} disabled={locked} />
          </section>

          <div className="col c4">
            <section className="sheet">
              <span className="eyb">Exercícios</span>
              {exList(n).map((e) => (
                <a key={e.id} className="exi" href={`#x-${e.id}`}>
                  <span className="row" style={{ justifyContent: 'space-between' }}><span className="mode">{e.mode}</span><GradeBadge e={e} /></span>
                  <span className="t">{e.title}</span>
                  <Mono>{fmtMin(e.min)}</Mono>
                </a>
              ))}
            </section>
            {m.tip && <section className="sheet"><span className="eyb">Prática</span><p style={{ fontSize: 14.5 }}>{m.tip}</p></section>}
            {m.res.length > 0 && (
              <section className="sheet" style={{ gap: 4 }}>
                <span className="eyb" style={{ marginBottom: 6 }}>Para estudar</span>
                <Resources res={m.res} />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
