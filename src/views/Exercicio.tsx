// E1: enunciado à esquerda, resposta à direita, avaliação embaixo.
// Na versão estática não há IA embutida: você copia o pedido pronto, cola no Claude
// e registra aqui a nota que ele der.
import { useEffect, useRef, useState } from 'react';
import { M } from '../data';
import { EXI, gradePrompt, gradesFor, reviewPrompt, type Exercise } from '../domain/exercises';
import { status } from '../domain/progress';
import { copyText } from '../lib/clipboard';
import { clamp10, fmtT } from '../lib/format';
import { Attempts, GradeCard, PageHead, safeUrl } from '../components/ui';
import { useStore } from '../state/store';

const CLAUDE_URL = 'https://claude.ai/new';
const MAX_ANSWER = 60000;
/** Rascunhos ficam só na memória da aba: somem ao fechar, nunca vão para o disco. */
const drafts = new Map<string, string>();

function Timer({ min }: { min: number }) {
  const [left, setLeft] = useState(min * 60);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    let last = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      setLeft((l) => {
        const n = Math.max(0, l - (now - last) / 1000);
        if (n <= 0) setRun(false);
        return n;
      });
      last = now;
    }, 500);
    return () => clearInterval(t);
  }, [run]);
  return (
    <div className="row" style={{ gap: 14, marginTop: 6 }}>
      <span className="timer" role="timer" aria-live="off">{fmtT(left)}</span>
      <button className="btn sm" type="button" onClick={() => { if (!run && left <= 0) setLeft(min * 60); setRun(!run); }}>{run ? 'Pausar' : 'Iniciar'}</button>
      <button className="btn sm" type="button" onClick={() => { setRun(false); setLeft(min * 60); }}>Zerar</button>
    </div>
  );
}

function CopyButton({ text, label, solid, disabled }: { text: string; label: string; solid?: boolean; disabled?: boolean }) {
  const [msg, setMsg] = useState('');
  const box = useRef<HTMLTextAreaElement>(null);
  const [showBox, setShowBox] = useState(false);
  return (
    <>
      <button className={`btn${solid ? ' solid' : ''}`} type="button" disabled={disabled} onClick={async () => {
        const ok = await copyText(text, box.current);
        if (ok) { setMsg('Copiado. Cole numa conversa com o Claude.'); setShowBox(false); }
        else { setMsg('Não deu para copiar automaticamente. Selecione o texto abaixo e copie.'); setShowBox(true); }
        setTimeout(() => setMsg(''), 5000);
      }}>{label}</button>
      {msg && <span className="ok" role="status">{msg}</span>}
      <textarea ref={box} className="promptbox" readOnly value={text} hidden={!showBox} aria-label="Pedido para copiar" />
    </>
  );
}

function Enunciado({ e, locked }: { e: Exercise; locked: boolean }) {
  const url = safeUrl(e.url);
  return (
    <section className="sheet c5">
      <span className="mode">{e.mode}{e.mode === 'Na mão' ? ` · sem IA · ${e.min} min` : ''}</span>
      <h2 style={{ fontSize: 'clamp(22px,2.6vw,30px)' }}>{e.title}</h2>
      {e.mode === 'Na mão' && (
        <>
          <p>Resolva sem IA. Leia o enunciado oficial no LeetCode, escreva a solução no seu editor e cole aqui com a complexidade de tempo e de espaço.</p>
          {url && <a className="btn" href={url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>Abrir no LeetCode ↗</a>}
          <Timer min={e.min} />
        </>
      )}
      {e.mode === 'Explique' && <p>Responda com suas palavras, como se explicasse para alguém do time. Use um exemplo concreto. Não precisa ser longo: precisão vale mais que volume.</p>}
      {e.mode === 'Projeto' && <p>Faça com ou sem IA, como faria no trabalho. Cole o código principal (ou o link do repositório) e um resumo curto das decisões e de como testou.</p>}
      {e.mode === 'Revise a IA' && (
        <>
          <p>Peça ao Claude um trecho de código realista sobre {M[e.n].t}, com um ou dois bugs sutis escondidos. Revise como faria num pull request.</p>
          <ol className="bul">
            <li>Copie o pedido de código e cole numa conversa nova com o Claude.</li>
            <li>Escreva aqui os bugs que achou, a causa e a correção, citando as linhas.</li>
            <li>Copie o pedido de avaliação e cole <b>na mesma conversa</b>, para ele comparar com os bugs que plantou.</li>
          </ol>
          <div className="row"><CopyButton text={reviewPrompt(e.n)} label="Copiar pedido de código" disabled={locked} /></div>
        </>
      )}
      <a className="linkbtn" href={CLAUDE_URL} target="_blank" rel="noopener noreferrer">Abrir o Claude numa nova aba ↗</a>
    </section>
  );
}

function GradeForm({ e, disabled }: { e: Exercise; disabled: boolean }) {
  const { addGrade } = useStore();
  const [nota, setNota] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const valid = nota.trim() !== '' && Number.isFinite(Number(nota.replace(',', '.'))) && Number(nota.replace(',', '.')) >= 0 && Number(nota.replace(',', '.')) <= 10;
  return (
    <form className="gradeform" onSubmit={(ev) => {
      ev.preventDefault();
      if (!valid || disabled) return;
      const v = Math.round(clamp10(nota.replace(',', '.')) * 10) / 10;
      addGrade({ exId: e.id, n: e.n, mode: e.mode, title: e.title, nota: v, notes: notes.trim().slice(0, 4000) });
      setNota(''); setNotes(''); setMsg(v >= 7 ? 'Nota registrada: aprovado.' : 'Nota registrada. Vale tentar de novo.');
      setTimeout(() => setMsg(''), 5000);
    }}>
      <label className="eyb" htmlFor={`nota-${e.id}`}>Nota final (0 a 10)</label>
      <input id={`nota-${e.id}`} type="text" inputMode="decimal" maxLength={4} value={nota} disabled={disabled} autoComplete="off"
        onChange={(ev) => setNota(ev.target.value.replace(/[^\d.,]/g, ''))} placeholder="ex.: 7,5" aria-invalid={nota !== '' && !valid} />
      <label className="eyb" htmlFor={`obs-${e.id}`}>Parecer (opcional)</label>
      <textarea id={`obs-${e.id}`} rows={4} maxLength={4000} value={notes} disabled={disabled} onChange={(ev) => setNotes(ev.target.value)}
        placeholder="Cole o resumo do Claude: o que acertou, o que faltou e o próximo passo." />
      <span />
      <div className="row">
        <button className="btn solid" type="submit" disabled={!valid || disabled}>Registrar nota</button>
        {msg && <span className="ok" role="status">{msg}</span>}
      </div>
    </form>
  );
}

export function Exercicio({ id }: { id: string }) {
  const { p, removeGrade } = useStore();
  const e = EXI[id];
  const [answer, setAnswer] = useState(() => drafts.get(id) ?? '');
  useEffect(() => { drafts.set(id, answer); }, [id, answer]);

  if (!e) {
    return (
      <>
        <PageHead eyebrow="Exercício" title="Exercício não encontrado" crumb={{ href: '#exercicios', label: '← Exercícios' }} />
        <div className="note">Esse endereço não corresponde a nenhum exercício. Volte para a lista.</div>
      </>
    );
  }
  const locked = status(p, e.n) === 'lock';
  const grades = gradesFor(p, id), last = grades[0];

  return (
    <>
      <PageHead eyebrow={`U${e.n} · ${M[e.n].s} · ${e.mode}`} title="Exercício" crumb={{ href: `#t-${e.n}`, label: `← U${e.n} ${M[e.n].t}` }} />
      <div className="frame">
        <div className="g12">
          <Enunciado e={e} locked={locked} />
          <section className="sheet c7">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <label className="eyb" htmlFor={`resp-${id}`}>Sua resposta</label>
              {e.mode === 'Na mão' && <span className="hint">inclua a complexidade</span>}
            </div>
            <textarea className="resp" id={`resp-${id}`} value={answer} maxLength={MAX_ANSWER} disabled={locked}
              onChange={(ev) => setAnswer(ev.target.value)}
              placeholder={e.mode === 'Explique' ? 'Escreva sua explicação aqui.' : 'Cole o código, a revisão ou o resumo aqui.'} />
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <CopyButton text={gradePrompt(e, answer)} label="Copiar pedido de avaliação" solid disabled={locked || !answer.trim()} />
            </div>
            <p className="hint">
              {locked
                ? 'Este tópico está bloqueado. Conclua a base para registrar notas.'
                : 'O pedido leva sua resposta, o tópico e os critérios. Cole no Claude, leia o parecer e registre a nota abaixo. Sua resposta não é salva: fica só nesta aba.'}
            </p>
            <details className="peek">
              <summary className="eyb">Ver o pedido que será copiado</summary>
              <pre className="sent">{gradePrompt(e, answer)}</pre>
            </details>
          </section>

          <section className="sheet c12">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="eyb">Avaliação</span>
              {grades.length > 0 && <span className="hint">{grades.length} registro{grades.length > 1 ? 's' : ''}</span>}
            </div>
            {last ? (
              <>
                <GradeCard g={last} />
                <Attempts exId={id} />
                <div className="row"><button type="button" className="linkbtn" onClick={() => removeGrade(last.id)}>Apagar o último registro</button></div>
              </>
            ) : <p className="muted">Nenhuma nota ainda. Registre a nota que o Claude der; 7 ou mais conta como aprovado.</p>}
            <GradeForm key={id} e={e} disabled={locked} />
          </section>
        </div>
      </div>
    </>
  );
}
