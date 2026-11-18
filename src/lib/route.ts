// Rotas por hash (#hoje, #t-12, #x-lc-4-1) para funcionar em hospedagem estática sem configuração.
import { useEffect, useState } from 'react';
import { M } from '../data';

export type Route =
  | { v: 'hoje' | 'trilha' | 'exercicios' | 'avaliacoes' | 'carreira' }
  | { v: 'topico'; n: number }
  | { v: 'ex'; id: string };

const TABS = ['hoje', 'trilha', 'exercicios', 'avaliacoes', 'carreira'] as const;

export function parseHash(hash: string): Route {
  let h = '';
  try { h = decodeURIComponent(hash.replace(/^#/, '')); } catch { h = ''; }
  if ((TABS as readonly string[]).includes(h)) return { v: h as (typeof TABS)[number] };
  let m = /^t-(\d{1,2})$/.exec(h);
  if (m && M[Number(m[1])]) return { v: 'topico', n: Number(m[1]) };
  m = /^x-([a-z0-9-]{1,24})$/.exec(h);
  if (m) return { v: 'ex', id: m[1] };
  return { v: 'hoje' };
}

export function useRoute(): Route {
  const [r, setR] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const on = () => setR(parseHash(location.hash));
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const go = (hash: string) => { location.hash = hash; };
