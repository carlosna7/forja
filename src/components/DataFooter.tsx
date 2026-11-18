// Rodapé com exportar, importar e apagar o progresso. É o "backup" da versão estática.
import { useRef, useState } from 'react';
import { downloadFile } from '../lib/clipboard';
import { dayKey } from '../lib/format';
import { useStore } from '../state/store';

const MAX_IMPORT = 2 * 1024 * 1024; // 2 MB é muito mais do que um progresso real ocupa

export function DataFooter() {
  const { p, importState, resetAll } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const say = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 6000); };

  return (
    <div className="datafoot">
      <span className="eyb">Seus dados ficam só neste navegador</span>
      <div className="row">
        <button className="btn sm" type="button" onClick={() => { downloadFile(`forja-progresso-${dayKey()}.json`, JSON.stringify(p, null, 2)); say(true, 'Arquivo de progresso baixado.'); }}>
          Exportar progresso
        </button>
        <span className="btn sm filebtn">
          Importar progresso
          <input ref={file} type="file" accept="application/json,.json" aria-label="Importar progresso" onChange={async (ev) => {
            const f = ev.target.files?.[0];
            ev.target.value = '';
            if (!f) return;
            if (f.size > MAX_IMPORT) return say(false, 'Arquivo grande demais para ser um progresso da Forja.');
            try {
              const r = importState(JSON.parse(await f.text()));
              say(r.ok, r.message);
            } catch {
              say(false, 'Não consegui ler esse arquivo. Ele precisa ser o JSON exportado por aqui.');
            }
          }} />
        </span>
        {!confirmReset
          ? <button className="btn sm" type="button" onClick={() => setConfirmReset(true)}>Apagar tudo</button>
          : (
            <>
              <span className="err">Apagar todo o progresso e as notas deste navegador?</span>
              <button className="btn sm solid" type="button" onClick={() => { resetAll(); setConfirmReset(false); say(true, 'Progresso apagado.'); }}>Sim, apagar</button>
              <button className="btn sm" type="button" onClick={() => setConfirmReset(false)}>Cancelar</button>
            </>
          )}
      </div>
      {msg && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.text}</p>}
    </div>
  );
}
