import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build estático para a Vercel. O polyfill de modulepreload fica desligado para
// não gerar script inline, o que permite uma CSP com script-src 'self' (ver vercel.json).
// assetsInlineLimit 0: nenhuma fonte ou imagem vira data: URI, então font-src 'self' basta.
export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
    sourcemap: false,
    target: 'es2022'
  }
});
