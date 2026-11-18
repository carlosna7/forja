# Deploy

O site é estático: qualquer hospedagem serve. A configuração pronta é para a **Vercel**, que lê o [`vercel.json`](../vercel.json) com build, pasta de saída e cabeçalhos de segurança.

## Primeira vez (pelo painel)

1. Entre em [vercel.com/new](https://vercel.com/new) com a conta do GitHub.
2. Em **Import Git Repository**, escolha `carlosna7/forja`. Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o repositório.
3. A Vercel detecta Vite. Confira:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`
   - Node.js: 22.x (em *Settings → General*)
4. **Deploy**.

A partir daí, cada `git push` na `main` publica em produção e cada pull request ganha uma URL de pré-visualização.

## Pela linha de comando

```bash
npm i -g vercel
vercel login
vercel link          # associa a pasta ao projeto
vercel --prod        # publica
```

## Conferir depois de publicar

```bash
URL=https://forja-xxxx.vercel.app
curl -sI $URL | grep -iE "content-security|strict-transport|x-frame"
curl -sI $URL/assets/ | head -1
```

No navegador:

1. Abra o console (F12) e recarregue. Não deve haver erro de CSP.
2. Marque um subtópico, recarregue a página e confira que continua marcado.
3. Teste em [securityheaders.com](https://securityheaders.com); o esperado é nota A.

## Domínio próprio

*Settings → Domains → Add*. A Vercel mostra os registros DNS. Com o domínio funcionando há algumas semanas, dá para acrescentar `; preload` no HSTS e inscrever em [hstspreload.org](https://hstspreload.org).

## Outras hospedagens

`npm run build` gera `dist/`. Em Netlify, Cloudflare Pages ou GitHub Pages, copie os cabeçalhos de `vercel.json` para o formato de cada uma (`_headers` no Netlify e no Cloudflare). No GitHub Pages não dá para definir cabeçalhos; a CSP pode ir numa `<meta http-equiv>`, mas `frame-ancestors` não funciona por meta.

## Progresso entre aparelhos

O progresso fica no navegador de cada aparelho e domínio. Trocar de domínio (por exemplo, da URL `.vercel.app` para um domínio próprio) começa do zero: exporte antes e importe no endereço novo.
