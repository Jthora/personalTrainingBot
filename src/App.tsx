import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import InitialDataLoader from './utils/InitialDataLoader';
import LoadingMessage from './components/LoadingMessage/LoadingMessage'; // Import the new component
import { WorkoutScheduleProvider } from './context/WorkoutScheduleContext';
import { CoachSelectionProvider } from './context/CoachSelectionContext';
import { warmCaches } from './utils/cacheWarmHints';
import RecapModal from './components/RecapModal/RecapModal';
import RecapToast from './components/RecapToast/RecapToast';
import { mark, measure } from './utils/perf';
import { schedulePostPaintTasks } from './utils/phaseTasks';
import CacheIndicator from './components/CacheIndicator/CacheIndicator';
import { registerScheduleRefreshInterval, registerScheduleRefreshOnFocus } from './utils/ScheduleLoader';
import { logRuntimePayloadSample } from './utils/payloadLogging';
import ScheduleNavigationRefresh from './components/ScheduleNavigationRefresh/ScheduleNavigationRefresh';

const App: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Add loading progress state
  const [initializationPromise, setInitializationPromise] = useState<Promise<void> | null>(null);
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
    if (!isDataLoaded) return;
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
  }, [isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;


    schedulePostPaintTasks();

    const unregisterFocus = registerScheduleRefreshOnFocus();
    const unregisterInterval = registerScheduleRefreshInterval();

    logRuntimePayloadSample({ sampleRate: 0.2, maxEntries: 8 });
    return () => {
      unregisterFocus?.();
      unregisterInterval?.();
    };
  }, [isDataLoaded]);

  if (!isDataLoaded) {
    return <LoadingMessage progress={loadingProgress} />; // Use the new component with progress
  }

  return (
    <WorkoutScheduleProvider>
      <CoachSelectionProvider>
        <Router>
          <CacheIndicator />
          <ScheduleNavigationRefresh />
          <AppRoutes />
          <RecapToast />
          <RecapModal />
        </Router>
      </CoachSelectionProvider>
    </WorkoutScheduleProvider>
  );
}

export default App;