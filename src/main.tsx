import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/theme.css'; // Import the global theme
import { mark } from './utils/perf';
import { registerCacheDebug } from './utils/cache/debugCache';
import { scheduleManifestPrefetch } from './utils/prefetchHints';
import { registerServiceWorkerIfEnabled } from './utils/serviceWorker';

mark('load:boot_start');

scheduleManifestPrefetch();
registerServiceWorkerIfEnabled();

if (import.meta.env.DEV) {
  registerCacheDebug();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
