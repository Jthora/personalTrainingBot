import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/theme.css'; // Import the global theme
import { mark } from './utils/perf';
import { registerCacheDebug } from './utils/cache/debugCache';
import { scheduleManifestPrefetch } from './utils/prefetchHints';
import { registerServiceWorker } from './utils/serviceWorker';
import { SettingsProvider, readLowDataPreference } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

mark('load:boot_start');

const lowDataPersisted = readLowDataPreference();
if (!lowDataPersisted) {
  scheduleManifestPrefetch();
}
registerServiceWorker();

if (import.meta.env.DEV) {
  registerCacheDebug();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary level="root">
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ErrorBoundary>
  </StrictMode>,
)
