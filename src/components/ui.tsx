// Peças visuais reaproveitadas em todas as telas.
import type { ReactNode } from 'react';
import { M, RLBL, type Resource, type TopicEntry } from '../data';
import { stat, status, STATUS_LABEL } from '../domain/progress';
import { best, gradesFor, type Exercise } from '../domain/exercises';
import { fmtDate, fmtN, pad2 } from '../lib/format';
import { useStore } from '../state/store';
import type { Grade } from '../state/persist';

/** Ícone de tópico: mira tracejada de prancheta + o traço próprio de cada tópico. */
export function Icon({ g, size, label }: { g: string; size: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <circle cx="24" cy="24" r="19" stroke="#8EC5F0" strokeDasharray="2 3" />
      <path d="M24 1v5M24 42v5M1 24h5M42 24h5" stroke="#8EC5F0" />
      <path d={g} />
    </svg>
  );
}

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#123E6E" strokeWidth={2} aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" /></svg>
);

/** Bloco de tópico (o "quadradinho" da trilha). */
export function Blk({ n, here, note }: { n: number; here?: boolean; note?: string }) {
  const { p } = useStore();
  const st = status(p, n), s = stat(p, `m${n}`);
  return (
    <a className={`blk ${st}${here ? ' here' : ''}`} href={`#t-${n}`} aria-label={`U${n} ${M[n].t}, ${STATUS_LABEL[st]}`}>
      <span className="u">U{n}</span>
      <span className="n">{M[n].s}</span>
      <span className="s">{note ?? (st === 'lock' ? 'bloqueado' : `${s.p}%`)}</span>
    </a>
  );
}

export function Rule({ p, o }: { p: number; o?: boolean }) {
  return <div className={`rule${o ? ' o' : ''}`}><i style={{ width: `${Math.max(0, Math.min(100, p))}%` }} /></div>;
}

export function SaveBadge() {
  const { saveStatus } = useStore();
  return (
    <span className="status" data-s={saveStatus === 'local' ? 'local' : 'error'} role="status">
      <i />{saveStatus === 'local' ? 'Salvo neste navegador' : 'Não foi possível salvar'}
    </span>
  );
}

export function PageHead({ eyebrow, title, crumb }: { eyebrow: ReactNode; title: ReactNode; crumb?: { href: string; label: string } }) {
  return (
    <div className="vhead">
      <div className="lead">
        {crumb && <a className="crumb" href={crumb.href}>{crumb.label}</a>}
        <p className="eyb">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <SaveBadge />
    </div>
  );
}

export const Mono = ({ children, size = 10.5, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span className="mono" style={{ fontSize: size, color: color ?? 'var(--graphite)' }}>{children}</span>
);

/** Lista marcável de subtópicos. `key` é o prefixo do id salvo ("m12", "pC"). */
export function Checklist({ k, top, disabled }: { k: string; top: TopicEntry[]; disabled?: boolean }) {
  const { p, toggleItem } = useStore();
  let i = 0;
  return (
    <ul className="topics">
      {top.map((x, idx) => {
        let s = Array.isArray(x) ? x[0] : x;
        const tag = Array.isArray(x) ? x[1] : null;
        if (s.startsWith('#')) return <li className="grp" key={`g${idx}`}>{s.slice(1)}</li>;
        const use = s.startsWith('!');
        if (use) s = s.slice(1);
        const id = `${k}.${i++}`;
        return (
          <li key={id}>
            <label className={`tp${disabled ? ' dis' : ''}`}>
              <input type="checkbox" checked={!!p.done[id]} disabled={disabled} onChange={(e) => toggleItem(id, e.target.checked)} />
              <span className="box"><Check /></span>
              <span className="num">{pad2(i)}</span>
              <span className="txt">
                {s}
                {use && <span className="use" title="Você já usa no dia a dia">já usa</span>}
                {tag != null && (typeof tag === 'number'
                  ? <> <a className="when" href={`#t-${tag}`}>U{tag} {M[tag].s}</a></>
                  : <> <span className="when">{tag}</span></>)}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/** Só links http(s) viram âncoras; abrem em nova aba sem passar referência nem acesso à janela. */
export const safeUrl = (u?: string) => (u && /^https:\/\//.test(u) ? u : undefined);

export function Resources({ res }: { res: Resource[] }) {
  return (
    <>
      {res.map(([ty, label, url], i) => {
        const href = safeUrl(url);
        return href
          ? <a key={i} className="res" href={href} target="_blank" rel="noopener noreferrer"><span className="k">{RLBL[ty]}</span><span>{label} ↗</span></a>
          : <div key={i} className="res"><span className="k">{RLBL[ty]}</span><span>{label}</span></div>;
      })}
    </>
  );
}

export function GradeBadge({ e }: { e: Exercise }) {
  const { p } = useStore();
  const b = best(p, e.id);
  if (b == null) return <span className="badge">novo</span>;
  return <span className={`badge ${b >= 7 ? 'ok' : 'bad'}`}>{b >= 7 ? 'aprovado · ' : 'melhor nota · '}{fmtN(b)}</span>;
}

/** Carimbo de nota + observações registradas. */
export function GradeCard({ g }: { g: Grade }) {
  const ok = g.nota >= 7;
  return (
    <div className="parecer">
      <div className={`stamp${ok ? ' ok' : ''}`}><b>{fmtN(g.nota)}</b><span>{ok ? 'APROVADO' : 'REFAZER'}</span></div>
      <div className="gnotes">
        <Mono size={11}>Registrada em {fmtDate(g.createdAt)}</Mono>
        {g.notes ? <pre className="sent">{g.notes}</pre> : <span className="hint">Sem observações.</span>}
      </div>
    </div>
  );
}

export function Attempts({ exId }: { exId: string }) {
  const { p } = useStore();
  const l = gradesFor(p, exId).slice().reverse();
  if (l.length < 2) return null;
  return (
    <div className="row" style={{ gap: 8 }}>
      <span className="eyb">Tentativas</span>
      {l.map((g, i) => (
        <span key={g.id} className="row" style={{ gap: 8 }}>
          {i > 0 && <span className="badge">→</span>}
          <span className={`badge ${g.nota >= 7 ? 'ok' : 'bad'}`}>{i + 1}ª · {fmtN(g.nota)}</span>
        </span>
      ))}
    </div>
  );
}
