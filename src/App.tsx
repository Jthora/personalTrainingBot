import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import InitialDataLoader from './utils/InitialDataLoader';
import LoadingMessage from './components/LoadingMessage/LoadingMessage'; // Import the new component
import { MissionScheduleProvider } from './context/MissionScheduleContext';
import { HandlerSelectionProvider } from './context/HandlerSelectionContext';
import { warmCaches } from './utils/cacheWarmHints';
import RecapModal from './components/RecapModal/RecapModal';
import RecapToast from './components/RecapToast/RecapToast';
import { mark, measure } from './utils/perf';
import { schedulePostPaintTasks } from './utils/phaseTasks';
import CacheIndicator from './components/CacheIndicator/CacheIndicator';
import { registerScheduleRefreshInterval, registerScheduleRefreshOnFocus } from './utils/ScheduleLoader';
import { logRuntimePayloadSample } from './utils/payloadLogging';
import ScheduleNavigationRefresh from './components/ScheduleNavigationRefresh/ScheduleNavigationRefresh';
import NetworkStatusIndicator from './components/NetworkStatusIndicator/NetworkStatusIndicator';
import InstallBanner from './components/InstallBanner/InstallBanner';
import UpdateNotification from './components/UpdateNotification/UpdateNotification';
import { useSettings } from './context/SettingsContext';
import { isFeatureEnabled } from './config/featureFlags';
import { startGunProfileBridge, stopGunProfileBridge } from './services/gunProfileBridge';
import { startStoreSyncs, stopStoreSyncs } from './services/gunStoreSyncs';
import { GunIdentityService } from './services/gunIdentity';

const App: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Add loading progress state
  const [initializationPromise, setInitializationPromise] = useState<Promise<void> | null>(null);
  const { lowDataMode } = useSettings();
  // Partial failures are logged to the console only; no UI surfacing.
  const shellMarkedRef = useRef(false);
  const criticalMarkedRef = useRef(false);
  const enrichmentMarkedRef = useRef(false);
  const idleMarkedRef = useRef(false);

  useEffect(() => {
    if (!initializationPromise) {
      const initializeData = async () => {
        console.log('App: Initializing data...');
        await InitialDataLoader.initialize(
          (progress) => setLoadingProgress(progress),
          (message) => console.warn(message)
        ); // Pass progress + partial failure callbacks
        setIsDataLoaded(true);
      };

      const promise = initializeData();
      setInitializationPromise(promise);
    } else {
      console.warn('App: Data is already loading.');
    }
  }, [initializationPromise]);

  useEffect(() => {
    if (typeof requestAnimationFrame !== 'function') {
      if (!shellMarkedRef.current) {
        mark('load:shell_painted');
        measure('load:boot_to_shell', 'load:boot_start', 'load:shell_painted');
        shellMarkedRef.current = true;
      }
      return undefined;
    }

    const raf = requestAnimationFrame(() => {
      if (shellMarkedRef.current) return;
      mark('load:shell_painted');
      measure('load:boot_to_shell', 'load:boot_start', 'load:shell_painted');
      shellMarkedRef.current = true;
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!isDataLoaded || criticalMarkedRef.current) return;
    mark('load:critical_ready');
    measure('load:shell_to_critical', 'load:shell_painted', 'load:critical_ready');
    criticalMarkedRef.current = true;
  }, [isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || lowDataMode) return;
    const cancelWarm = warmCaches(() => {
      if (!enrichmentMarkedRef.current) {
        mark('load:enrichment_done');
        measure('load:critical_to_enrichment', 'load:critical_ready', 'load:enrichment_done');
        enrichmentMarkedRef.current = true;
      }
      if (!idleMarkedRef.current) {
        mark('load:idle_warm_done');
        measure('load:enrichment_to_idle', 'load:enrichment_done', 'load:idle_warm_done');
        idleMarkedRef.current = true;
      }
    });

    return () => cancelWarm?.();
  }, [isDataLoaded, lowDataMode]);

  useEffect(() => {
    if (!isDataLoaded) return;

    // Initialize Gun.js P2P identity bridge when flag is on
    if (isFeatureEnabled('p2pIdentity')) {
      startGunProfileBridge();
      startStoreSyncs();
      GunIdentityService.login(); // auto-login if stored identity exists
    }

    schedulePostPaintTasks();

    const unregisterFocus = registerScheduleRefreshOnFocus();
    const unregisterInterval = registerScheduleRefreshInterval();

    logRuntimePayloadSample({ sampleRate: 0.2, maxEntries: 8 });
    return () => {
      unregisterFocus?.();
      unregisterInterval?.();
      stopGunProfileBridge();
      stopStoreSyncs();
    };
  }, [isDataLoaded]);

  if (!isDataLoaded) {
    return <LoadingMessage progress={loadingProgress} />; // Use the new component with progress
  }

  return (
    <MissionScheduleProvider>
      <HandlerSelectionProvider>
        <Router>
          <CacheIndicator />
          <NetworkStatusIndicator />
          <InstallBanner />
          <UpdateNotification />
          <ScheduleNavigationRefresh />
          <AppRoutes />
          <RecapToast />
          <RecapModal />
        </Router>
      </HandlerSelectionProvider>
    </MissionScheduleProvider>
  );
}

export default App;