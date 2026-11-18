import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fontes servidas pelo próprio site (nada de Google Fonts): permite uma CSP com font-src 'self'.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/martian-mono/400.css';
import '@fontsource/martian-mono/500.css';
import './styles/global.css';
import { App } from './App';
import { StoreProvider } from './state/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);
