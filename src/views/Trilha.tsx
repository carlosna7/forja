// T3 (esquema de ligações) e T1 (colunas). A escolha fica salva.
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { LINES, LSHORT, M, ORDER } from '../data';
import { EDGE_PATHS, G, GH, GPOS, GW, gx, gy, walk } from '../domain/graph';
import { complete, lineStat, stat, status, STATUS_LABEL } from '../domain/progress';
import { Blk, Mono, PageHead } from '../components/ui';
import { go } from '../lib/route';
import { useStore } from '../state/store';

const marker = (id: string, c: string) => (
  <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke={c} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </marker>
);

function Esquema() {
  const { p, setUI } = useStore();
  const z = p.ui.z;
  const [sel, setSel] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; l: number; t: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const anc = sel != null ? walk(sel, false) : null, des = sel != null ? walk(sel, true) : null;
  const A = sel != null ? new Set([...anc!, sel]) : null, D = sel != null ? new Set([...des!, sel]) : null;

  const zoom = (d: number) => {
    if (d === 0) {
      const w = wrap.current?.clientWidth ?? GW;
      setUI({ z: Math.max(0.4, Math.min(1, Math.round(((w - 4) / GW) * 100) / 100)) });
    } else setUI({ z: Math.max(0.4, Math.min(1.6, Math.round((z + d * 0.1) * 10) / 10)) });
  };

  const onDown = (ev: RPointerEvent<HTMLDivElement>) => {
    if ((ev.target as HTMLElement).closest('.gn') || ev.pointerType === 'touch' || !wrap.current) return;
    drag.current = { x: ev.clientX, y: ev.clientY, l: wrap.current.scrollLeft, t: wrap.current.scrollTop };
    setDragging(true);
    wrap.current.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current, w = wrap.current;
    if (!d || !w) return;
    w.scrollLeft = d.l - (ev.clientX - d.x);
    w.scrollTop = d.t - (ev.clientY - d.y);
  };
  const onUp = () => { drag.current = null; setDragging(false); };

  const list = (s: Set<number>) => [...s].sort((a, b) => a - b).map((n) => `U${n} ${M[n].s}`).join(', ');

  return (
    <div className="frame">
      <div className="gbar">
        <span className="eyb">Esquema de ligações · arraste para mover</span>
        <div className="row">
          <button className="btn sm" type="button" onClick={() => zoom(-1)} aria-label="Diminuir zoom">−</button>
          <span className="mono" style={{ fontSize: 12, minWidth: 46, textAlign: 'center' }}>{Math.round(z * 100)}%</span>
          <button className="btn sm" type="button" onClick={() => zoom(1)} aria-label="Aumentar zoom">+</button>
          <button className="btn sm" type="button" onClick={() => zoom(0)}>Ajustar</button>
        </div>
      </div>
      <div className={`gwrap${dragging ? ' drag' : ''}`} ref={wrap} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="gsize" style={{ width: Math.round(GW * z), height: Math.round(GH * z) }}>
          <div className="gin" style={{ width: GW, height: GH, transform: `scale(${z})` }}>
            {LINES.map((l, c) => <span key={l.id} className="glab" style={{ left: gx(c), top: 8 }}>Linha {l.id} · {LSHORT[c]}</span>)}
            <svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`} aria-hidden="true">
              <defs>{marker('mi', '#EAF2FB')}{marker('md', '#7A9CC4')}{marker('mg', '#A6BCD6')}{marker('mp', '#FF8A4C')}</defs>
              {EDGE_PATHS.map((e, i) => {
                const ok = complete(p, e.a);
                let cls = `ed${e.soft ? ' soft' : ok ? '' : ' pend'}`, mk = e.soft ? 'mg' : ok ? 'mi' : 'md';
                if (A && D) {
                  const on = (A.has(e.a) && A.has(e.b)) || (D.has(e.a) && D.has(e.b));
                  cls += on ? ' hi' : ' fade';
                  if (on) mk = 'mp';
                }
                return <path key={i} className={cls} d={e.d} markerEnd={`url(#${mk})`} />;
              })}
            </svg>
            {ORDER.map((n) => {
              const P = GPOS[n], st = status(p, n), s = stat(p, `m${n}`);
              let c = `blk gn ${st}`;
              if (sel != null) { if (n === sel) c += ' sel'; else if (!A!.has(n) && !D!.has(n)) c += ' dim'; }
              return (
                <button key={n} type="button" className={c} style={{ left: gx(P.c), top: gy(P.r), width: G.BW, height: G.BH }}
                  aria-label={`U${n} ${M[n].t}, ${STATUS_LABEL[st]}`} aria-pressed={sel === n}
                  onClick={() => (sel === n ? go(`t-${n}`) : setSel(n))}>
                  <span className="u">U{n}</span><span className="n">{M[n].s}</span><span className="s">{st === 'lock' ? '' : `${s.p}%`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', gap: 14 }}>
        <p className="muted" style={{ fontSize: 14, flex: '1 1 360px' }}>
          {sel == null
            ? 'Toque num bloco para ver o que ele exige e o que libera; toque de novo para abrir. Linha cheia: a base já está pronta. Tracejada: ainda falta. Pontilhada: recomendado, não obrigatório.'
            : <><b style={{ color: 'var(--ink)' }}>U{sel} {M[sel].t}</b> · {STATUS_LABEL[status(p, sel)]}. Exige antes: {anc!.size ? list(anc!) : 'nada, é uma raiz'}. Libera: {des!.size ? list(des!) : 'nada, é o topo'}.</>}
        </p>
        {sel != null && <a className="btn solid" href={`#t-${sel}`}>Abrir prancha U{sel}</a>}
      </div>
    </div>
  );
}

function Colunas() {
  const { p } = useStore();
  return (
    <div className="frame">
      <div className="cols">
        {LINES.map((l) => {
          const s = lineStat(p, l);
          return (
            <div key={l.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}><Mono>Linha {l.id}</Mono><br />{l.name}</span>
                <span className="mono" style={{ fontSize: 11 }}>{s.p}%</span>
              </div>
              <div className="bus">{l.mods.map((n) => <Blk key={n} n={n} />)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Trilha() {
  const { p, setUI, setRequireProject } = useStore();
  const mode = p.ui.trilha;
  return (
    <>
      <PageHead eyebrow={`Trilha · ${LINES.length} linhas, ${ORDER.length} tópicos`} title="Trilha" />
      <div className="row" style={{ justifyContent: 'space-between', gap: 16 }}>
        <div className="seg" role="group" aria-label="Exibição">
          <button type="button" aria-pressed={mode === 'esquema'} onClick={() => setUI({ trilha: 'esquema' })}>Esquema</button>
          <button type="button" aria-pressed={mode === 'colunas'} onClick={() => setUI({ trilha: 'colunas' })}>Colunas</button>
        </div>
        <div className="legend">
          <span><i className="sw" style={{ background: 'var(--ink)' }} />concluído</span>
          <span><i className="sw" style={{ borderColor: 'var(--pencil)', borderWidth: 1.5 }} />em andamento</span>
          <span><i className="sw" style={{ borderColor: 'var(--cyan)' }} />liberado</span>
          <span><i className="sw" style={{ borderStyle: 'dashed', borderColor: 'var(--dash)' }} />bloqueado</span>
        </div>
        <label className="switch">
          <input type="checkbox" checked={p.requireProject} onChange={(e) => setRequireProject(e.target.checked)} />
          Exigir projeto aprovado (nota 7+) para concluir um tópico
        </label>
      </div>
      {mode === 'esquema' ? <Esquema /> : <Colunas />}
    </>
  );
}
