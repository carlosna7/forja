# Segurança

## Modelo de ameaça

A Forja é um site estático sem login, sem backend e sem cookies. O que existe para proteger:

1. **O progresso no navegador** (`localStorage`): não pode ser lido por outro site nem corrompido por um arquivo importado.
2. **A página em si**: não pode executar script de terceiros nem ser embutida para clickjacking.
3. **A cadeia de build**: dependências e o pipeline que publica o site.

Fora do escopo: o conteúdo das conversas com o Claude (acontecem no claude.ai) e a conta da Vercel/GitHub.

## Cabeçalhos HTTP

Definidos em [`vercel.json`](../vercel.json) e aplicados a todas as rotas.

| Cabeçalho | Valor | Protege contra |
| --- | --- | --- |
| `Content-Security-Policy` | ver abaixo | XSS, injeção de script, exfiltração |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | rebaixamento para HTTP |
| `X-Content-Type-Options` | `nosniff` | navegador "adivinhando" o tipo de arquivo |
| `X-Frame-Options` | `DENY` | clickjacking (navegadores antigos) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | vazamento da URL completa para outros sites |
| `Permissions-Policy` | câmera, microfone, localização, pagamento, USB e Topics desligados | uso indevido de APIs do navegador |
| `Cross-Origin-Opener-Policy` | `same-origin` | outra janela manipular esta (tabnabbing, XS-Leaks) |
| `Cross-Origin-Resource-Policy` | `same-origin` | outros sites embutirem os arquivos daqui |

### Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'none';
frame-ancestors 'none';
upgrade-insecure-requests
```

Não há `'unsafe-inline'` nem `'unsafe-eval'`. Para isso funcionar:

- **Sem script inline.** O Vite gera só `<script type="module" src>`; o polyfill de `modulepreload` (que seria inline) está desligado em `vite.config.ts`.
- **Sem `<style>` inline.** Todo CSS sai num arquivo. Estilos dinâmicos usam a prop `style` do React, que é aplicada via CSSOM e não é bloqueada pela CSP.
- **Sem recursos de terceiros.** As fontes vêm do pacote Fontsource e são servidas pelo próprio domínio; `assetsInlineLimit: 0` impede que virem `data:` URIs.
- **Nenhuma requisição de rede em tempo de execução.** `connect-src 'self'` bloqueia qualquer `fetch` para fora.

## Código

- **Nada de `dangerouslySetInnerHTML`**, `innerHTML` ou `eval`. Todo texto passa pelo escape automático do React.
- **Links externos** usam `target="_blank" rel="noopener noreferrer"` e só são renderizados se começarem com `https://` (`safeUrl` em `components/ui.tsx`). Isso impede `javascript:` mesmo que o conteúdo seja editado errado.
- **Rotas**: `parseHash` aceita só padrões conhecidos com tamanho limitado.
- **Busca e campos de texto** têm `maxLength`.
- **Rascunhos de resposta não são salvos** em disco: podem conter código do trabalho.

## Validação de dados

Tudo que entra no estado passa por `parsePersisted` (`src/state/persist.ts`), venha do `localStorage`, de outra aba ou de um arquivo importado:

| Campo | Regra |
| --- | --- |
| versão | precisa ser `v: 1`, senão volta ao padrão |
| `done` | só chaves no formato `m12.3` / `pC.0` com valor `true` |
| `days` | só datas `AAAA-MM-DD` |
| `plan` | só ids conhecidos; meses inteiros de 0 a 12; fim nunca antes do início |
| `grades` | id de exercício no formato esperado, modo conhecido, tópico 1–30, data válida; nota limitada a 0–10; textos cortados (300 e 4000 caracteres); no máximo 2000 registros |
| `ui` | só valores da lista; zoom entre 0,4 e 1,6 |

Chaves como `__proto__` não passam no filtro, o que evita poluição de protótipo. A importação rejeita arquivos acima de 2 MB. Os testes em `tests/persist.test.ts` cobrem esses casos.

## Dependências

- Poucas dependências de execução: `react`, `react-dom` e duas fontes.
- Versões **fixas** no `package.json` (sem `^`) e `package-lock.json` versionado; CI usa `npm ci`.
- O CI roda `npm audit --audit-level=high` e falha se houver vulnerabilidade alta ou crítica.
- O Dependabot abre PRs semanais para npm e mensais para GitHub Actions.
- O workflow tem `permissions: contents: read`.

## Como conferir

Depois do deploy:

```bash
curl -sI https://SEU-DOMINIO.vercel.app | grep -iE "content-security|strict-transport|x-frame|x-content|referrer|permissions|cross-origin"
```

Ou cole o endereço em [securityheaders.com](https://securityheaders.com) e no [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory). Abra o console do navegador e confira que não há nenhum aviso de CSP.

## Limites conhecidos

- O `localStorage` pode ser lido por qualquer extensão do navegador com permissão no site. Não guarde nada sensível nos campos de parecer.
- Sem backend, não há como proteger o progresso contra quem tem acesso físico ao computador.
- `Strict-Transport-Security` sem `preload`: para entrar na lista de preload do Chrome, use um domínio próprio e adicione `; preload` depois de testar.
