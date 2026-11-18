// Cabeçalho N1: marca, abas e busca com atalho ⌘K / Ctrl+K.
import { useEffect, useMemo, useRef, useState } from 'react';
import { M, ORDER } from '../data';
import { ALL_EXERCISES } from '../domain/exercises';
import { norm } from '../lib/format';
import { go, type Route } from '../lib/route';

const TABS = [
  ['hoje', 'Hoje'], ['trilha', 'Trilha'], ['exercicios', 'Exercícios'], ['avaliacoes', 'Avaliações'], ['carreira', 'Carreira']
] as const;

interface Hit { k: string; label: string; href: string; txt: string }
const INDEX: Hit[] = [
  ...ORDER.map((n) => ({ k: 'Tópico', label: `U${n} · ${M[n].t}`, href: `t-${n}`, txt: norm(`u${n} ${M[n].t} ${M[n].s} ${M[n].top.join(' ')}`) })),
  ...ALL_EXERCISES.filter((e) => e.mode !== 'Revise a IA').map((e) => ({
    k: e.mode, label: e.title.length > 90 ? `${e.title.slice(0, 88)}…` : e.title, href: `x-${e.id}`, txt: norm(`${e.title} ${M[e.n].s}`)
  }))
];

export function Header({ route }: { route: Route }) {
  const tab = route.v === 'topico' ? 'trilha' : route.v === 'ex' ? 'exercicios' : route.v;
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => {
    const words = norm(q.trim()).split(/\s+/).filter(Boolean);
    return words.length ? INDEX.filter((x) => words.every((w) => x.txt.includes(w))).slice(0, 8) : [];
  }, [q]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); input.current?.focus(); input.current?.select(); }
    };
    const onDown = (ev: PointerEvent) => { if (!box.current?.contains(ev.target as Node)) setOpen(false); };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onDown);
    return () => { removeEventListener('keydown', onKey); removeEventListener('pointerdown', onDown); };
  }, []);

  const routeKey = JSON.stringify(route);
  useEffect(() => { setQ(''); setOpen(false); }, [routeKey]);

  const close = () => { setQ(''); setOpen(false); input.current?.blur(); };
  const shown = open && q.trim() !== '';

  return (
    <header className="top">
      <a className="brand" href="#hoje">FORJA</a>
      <nav className="tabs" aria-label="Seções">
        {TABS.map(([id, label]) => (
          <a key={id} className="tab" href={`#${id}`} aria-current={tab === id ? 'page' : undefined}>{label}</a>
        ))}
      </nav>
      <div className="search" ref={box}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--graphite)' }} aria-hidden="true">⌘K</span>
        <label htmlFor="q" className="sr">Buscar tópico ou exercício</label>
        <input
          id="q" ref={input} type="text" placeholder="Buscar tópico ou exercício" autoComplete="off" maxLength={120}
          role="combobox" aria-expanded={shown} aria-controls="qres" value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(ev) => {
            if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
              ev.preventDefault();
              if (hits.length) setSel((s) => (s + (ev.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length);
            } else if (ev.key === 'Enter') {
              if (hits[sel]) { go(hits[sel].href); close(); }
            } else if (ev.key === 'Escape') close();
          }}
        />
        <div className="results" id="qres" role="listbox" hidden={!shown}>
          {hits.length ? hits.map((h, i) => (
            <a key={h.href} href={`#${h.href}`} role="option" aria-selected={i === sel} onClick={close}>
              <span className="k">{h.k}</span><span>{h.label}</span>
            </a>
          )) : (
            <a role="option" aria-selected={false}><span className="k">—</span><span>Nada encontrado para “{q.trim()}”</span></a>
          )}
        </div>
      </div>
    </header>
  );
}
