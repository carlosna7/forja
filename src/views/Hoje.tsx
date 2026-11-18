// H1: o exercício recomendado agora, progresso por linha e o próximo tópico a liberar.
import { useState } from 'react';
import { LINES, M } from '../data';
import { recommend } from '../domain/exercises';
import { currentLine, lineStat, missingFor, nextUnlock, overall, streak } from '../domain/progress';
import { Blk, Mono, PageHead, Rule } from '../components/ui';
import { useStore } from '../state/store';

const DESC: Record<string, (t: string) => string> = {
  'Na mão': () => 'Resolva sem IA, no LeetCode ou no seu editor. Depois copie o pedido de avaliação com a solução e a complexidade de tempo e espaço.',
  'Explique': () => 'Responda com suas palavras, como se explicasse para alguém do time. Um exemplo ajuda.',
  'Revise a IA': (t) => `Peça ao Claude um código sobre ${t} com bugs escondidos. Encontre os bugs, explique a causa e proponha a correção.`,
  'Projeto': () => 'Faça como faria no trabalho. Envie o código e um resumo das decisões para receber nota por critério.'
};

export function Hoje() {
  const { p } = useStore();
  const [skip, setSkip] = useState(0);
  const recs = recommend(p), r = recs.length ? recs[skip % recs.length] : null;
  const o = overall(p), nx = nextUnlock(p), cur = currentLine(p), stk = streak(p);
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const miss = nx ? missingFor(p, nx) : [];
  const left = miss.reduce((a, m) => a + m.left, 0);

  return (
    <>
      <PageHead eyebrow={today} title="Hoje" />
      <div className="frame">
        <div className="g12">
          <section className="sheet c8" style={{ padding: '28px 30px', gap: 16 }}>
            {!r ? (
              <>
                <span className="eyb">Agora</span>
                <h2 style={{ fontSize: 32 }}>Tudo em dia</h2>
                <p className="muted">Não há exercício pendente nos tópicos liberados. Marque subtópicos na trilha para liberar os próximos.</p>
                <div className="row"><a className="btn solid" href="#trilha">Abrir a trilha</a></div>
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="eyb">Agora</span>
                  <span className="timer" aria-label="Tempo sugerido">{r.e.min} min</span>
                </div>
                <span className="mode">{r.e.mode}{r.e.mode === 'Na mão' ? ' · sem IA' : ''}</span>
                <h2 style={{ fontSize: 'clamp(24px,3vw,36px)' }}>{r.e.title}</h2>
                <p style={{ fontSize: 16, maxWidth: '66ch' }}>{DESC[r.e.mode](M[r.e.n].t)}</p>
                <Mono size={11.5}>Por que este: {r.why}</Mono>
                <div className="row">
                  <a className="btn solid" href={`#x-${r.e.id}`}>{r.e.mode === 'Na mão' ? 'Começar sem IA' : 'Começar'}</a>
                  <button className="btn" type="button" onClick={() => setSkip((s) => s + 1)}>Trocar por outro</button>
                </div>
              </>
            )}
          </section>

          <div className="col c4">
            <section className="sheet">
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="eyb">Projeto executado</span>
                <span style={{ fontStretch: '125%', fontWeight: 800, fontSize: 32 }}>{o.p}%</span>
              </div>
              {LINES.map((l) => {
                const s = lineStat(p, l);
                return (
                  <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) 42px', gap: 10, alignItems: 'center' }}>
                    <Mono>L{l.id}</Mono><Rule p={s.p} /><span className="mono" style={{ fontSize: 10.5, textAlign: 'right' }}>{s.p}%</span>
                  </div>
                );
              })}
              <p className="hint">{o.mods} de 30 módulos concluídos · {stk} dia{stk === 1 ? '' : 's'} seguido{stk === 1 ? '' : 's'}</p>
            </section>
            {nx != null && (
              <div className="tb">
                <div className="full">
                  <span className="eyb">Próximo a liberar</span>
                  <div style={{ fontStretch: '125%', fontWeight: 800, fontSize: 19, marginTop: 4 }}>
                    <a href={`#t-${nx}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>U{nx} · {M[nx].s}</a>
                  </div>
                </div>
                <div className="l">
                  <span className="eyb">Depende de</span>
                  <div style={{ marginTop: 4 }}>{miss.map((m) => `U${m.n} ${M[m.n].s}`).join(', ')}</div>
                </div>
                <div>
                  <span className="eyb">Faltam</span>
                  <div style={{ marginTop: 4 }}>{left} subtópico{left === 1 ? '' : 's'}{miss.some((m) => m.needProject) ? ' e projeto aprovado' : ''}</div>
                </div>
              </div>
            )}
          </div>

          <section className="sheet c12">
            <span className="eyb">Onde você está · Linha {cur.id}, {cur.name}</span>
            <div className="hbus">{cur.mods.map((n) => <Blk key={n} n={n} />)}</div>
          </section>
        </div>
      </div>
    </>
  );
}
