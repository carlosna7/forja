// Permite rodar os testes com `node --test` direto nos arquivos .ts do projeto,
// sem dependências extras: resolve imports sem extensão ("../data" -> "../data/index.ts").
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(spec, ctx, next) {
  if ((spec.startsWith('.') || spec.startsWith('/')) && !/\.[cm]?[jt]sx?$|\.json$/.test(spec) && ctx.parentURL) {
    for (const ext of ['.ts', '/index.ts']) {
      const url = new URL(spec + ext, ctx.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, ctx);
    }
  }
  return next(spec, ctx);
}
