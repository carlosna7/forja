import { useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DataFooter } from './components/DataFooter';
import { useRoute, type Route } from './lib/route';
import { Avaliacoes } from './views/Avaliacoes';
import { Carreira } from './views/Carreira';
import { Exercicio } from './views/Exercicio';
import { Exercicios } from './views/Exercicios';
import { Hoje } from './views/Hoje';
import { Topico } from './views/Topico';
import { Trilha } from './views/Trilha';

const TITLES: Record<string, string> = { hoje: 'Hoje', trilha: 'Trilha', exercicios: 'Exercícios', avaliacoes: 'Avaliações', carreira: 'Carreira', topico: 'Tópico', ex: 'Exercício' };

function View({ r }: { r: Route }) {
  switch (r.v) {
    case 'trilha': return <Trilha />;
    case 'exercicios': return <Exercicios />;
    case 'avaliacoes': return <Avaliacoes />;
    case 'carreira': return <Carreira />;
    case 'topico': return <Topico n={r.n} />;
    case 'ex': return <Exercicio key={r.id} id={r.id} />;
    default: return <Hoje />;
  }
}

export function App() {
  const route = useRoute();
  const main = useRef<HTMLElement>(null);
  const key = JSON.stringify(route);
  const first = useRef(true);

  useEffect(() => {
    document.title = `${TITLES[route.v]} · Forja`;
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [key, route.v]);

  return (
    <div className="wrap">
      <a className="skip" href="#conteudo" onClick={(e) => { e.preventDefault(); main.current?.focus(); }}>Pular para o conteúdo</a>
      <Header route={route} />
      <main id="conteudo" ref={main} tabIndex={-1}>
        <View r={route} key={route.v === 'topico' ? key : route.v} />
      </main>
      <DataFooter />
      <p className="foot">Forja · trilha de engenharia de software do Carlos · <a href="https://github.com/carlosna7/forja" target="_blank" rel="noopener noreferrer">código no GitHub</a></p>
    </div>
  );
}
