// Exercícios de cada tópico, recomendação do dia e os pedidos que você cola no Claude.
import { CRIT, M, MODE_DAY, ORDER, type Mode } from '../data';
import { fmtN } from '../lib/format';
import type { Persisted } from '../state/persist';
import { status } from './progress';

export interface Exercise { id: string; n: number; mode: Mode; title: string; url?: string; min: number }

export function exList(n: number): Exercise[] {
  const m = M[n];
  const list: Exercise[] = m.lc.map(([num, name, slug]) => ({
    id: `lc-${n}-${num}`, n, mode: 'Na mão', title: `LeetCode ${num} · ${name}`, url: `https://leetcode.com/problems/${slug}/`, min: 25
  }));
  list.push({ id: `ex-${n}`, n, mode: 'Explique', title: m.ex, min: 10 });
  list.push({ id: `rv-${n}`, n, mode: 'Revise a IA', title: `Ache o bug num código de ${m.s} gerado por IA`, min: 15 });
  list.push({ id: `pj-${n}`, n, mode: 'Projeto', title: m.pj, min: 120 });
  return list;
}
export const EXI: Record<string, Exercise> = {};
ORDER.forEach((n) => exList(n).forEach((e) => (EXI[e.id] = e)));
export const ALL_EXERCISES = ORDER.flatMap((n) => exList(n));

export const gradesFor = (p: Persisted, exId: string) =>
  p.grades.filter((g) => g.exId === exId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export function best(p: Persisted, exId: string): number | null {
  const l = gradesFor(p, exId);
  return l.length ? Math.max(...l.map((g) => g.nota)) : null;
}
export function lastPractice(p: Persisted, n: number): number | null {
  const l = p.grades.filter((g) => g.n === n);
  return l.length ? Math.max(...l.map((g) => Date.parse(g.createdAt) || 0)) : null;
}

export interface Rec { e: Exercise; score: number; why: string }
/**
 * Pontuação simples: tópico em andamento > liberado > concluído (revisão), bônus para o modo do dia,
 * para "Na mão" (mantém a lógica ativa) e para tópicos parados há 7 dias ou mais.
 * Exercícios já aprovados (nota 7+) saem da lista; projetos só aparecem em tópicos já começados.
 */
export function recommend(p: Persisted): Rec[] {
  const now = Date.now(), md = MODE_DAY[new Date().getDay()], out: Rec[] = [];
  ORDER.forEach((n, i) => {
    const st = status(p, n);
    if (st === 'lock') return;
    const lp = lastPractice(p, n), days = lp ? Math.floor((now - lp) / 864e5) : null;
    exList(n).forEach((e) => {
      const b = best(p, e.id);
      if (b != null && b >= 7) return;
      if (e.mode === 'Projeto' && st === 'open') return;
      let score = (st === 'doing' ? 30 : st === 'open' ? 18 : 10) - i * 0.3;
      if (e.mode === md) score += 8;
      if (e.mode === 'Na mão') score += 3;
      if (days != null && days >= 7) score += 5;
      if (b != null) score += 2;
      let why = st === 'doing' ? `Tópico em andamento: U${n} ${M[n].s}` : st === 'done' ? `Revisão de um tópico concluído: U${n} ${M[n].s}` : `Tópico liberado: U${n} ${M[n].s}`;
      if (days != null && days >= 7) why = `Faz ${days} dias que você não pratica ${M[n].s}`;
      if (b != null) why = `Você tirou ${fmtN(b)} aqui; vale tentar de novo`;
      if (e.mode === md) why += ` · hoje é dia de “${md}”`;
      out.push({ e, score, why });
    });
  });
  return out.sort((a, b) => b.score - a.score).slice(0, 15);
}

const topicsOf = (n: number) => M[n].top.filter((x) => !x.startsWith('#')).map((x) => x.replace(/^!/, '')).join('; ');

/** Pedido para colar no Claude e receber a avaliação da sua resposta. */
export function gradePrompt(e: Exercise, answer: string) {
  const crit = CRIT[e.mode];
  const ctx: Record<Mode, string> = {
    'Na mão': `Problema: ${e.title} (LeetCode). Resolvi sem IA. Avalie se a solução resolve o problema, se a complexidade que informei bate com o código e se trato os casos de borda. Se eu não informei a complexidade, desconte no critério Complexidade.`,
    'Explique': `Pergunta conceitual: ${e.title}`,
    'Projeto': `Projeto prático: ${e.title}\nAvalie como um revisor sênior faria num pull request. Se faltar algo para avaliar, como testes, diga isso e desconte só no critério correspondente.`,
    'Revise a IA': 'Este é o exercício de revisão de código que você gerou nesta conversa. Compare minha resposta com os bugs que você plantou.'
  };
  return `Avalie meu exercício de engenharia de software. Seja rigoroso e justo, e responda em português do Brasil.

Tópico: U${e.n} ${M[e.n].t}
Modo: ${e.mode}
${ctx[e.mode]}

Minha resposta (tudo entre as marcas é a resposta):
<<<RESPOSTA
${answer.trim() || '(cole aqui a sua resposta)'}
RESPOSTA>>>

Dê uma nota de 0 a 10 para cada critério: ${crit.join(', ')}. A nota final é a média, com uma casa decimal; 7 ou mais significa aprovado.
Responda assim: nota final, nota de cada critério com um comentário curto, o que acertei, o que faltou e o próximo passo.`;
}

/** Pedido para o Claude gerar um código com bugs escondidos para você revisar. */
export function reviewPrompt(n: number) {
  return `Crie um exercício de revisão de código para eu praticar "${M[n].t}".
Escreva um trecho realista em TypeScript (Node ou NestJS, ou SQL se fizer mais sentido), com 15 a 40 linhas e números de linha, como se tivesse sido gerado por uma IA, contendo 1 ou 2 bugs sutis ligados a estes conceitos: ${topicsOf(n)}.
Diga em uma ou duas frases o que o código deveria fazer. Não comente nem dê pistas dos bugs. Guarde a lista de bugs para avaliar a minha revisão quando eu responder nesta mesma conversa.`;
}
