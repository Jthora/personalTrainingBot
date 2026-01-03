import { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import InitialDataLoader from './utils/InitialDataLoader';
import LoadingMessage from './components/LoadingMessage/LoadingMessage'; // Import the new component
import { WorkoutScheduleProvider } from './context/WorkoutScheduleContext';
import { CoachSelectionProvider } from './context/CoachSelectionContext';
import { warmCaches } from './utils/cacheWarmHints';
import RecapModal from './components/RecapModal/RecapModal';
import RecapToast from './components/RecapToast/RecapToast';

const App: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Add loading progress state
  const [initializationPromise, setInitializationPromise] = useState<Promise<void> | null>(null);

  useEffect(() => {
    if (!initializationPromise) {
      const initializeData = async () => {
        console.log('App: Initializing data...');
        await InitialDataLoader.initialize((progress) => setLoadingProgress(progress)); // Pass progress callback
        setIsDataLoaded(true);
      };

      const promise = initializeData();
      setInitializationPromise(promise);
    } else {
      console.warn('App: Data is already loading.');
    }
  }, [initializationPromise]);

  useEffect(() => {
    if (!isDataLoaded) return;
    warmCaches();
  }, [isDataLoaded]);

  if (!isDataLoaded) {
    return <LoadingMessage progress={loadingProgress} />; // Use the new component with progress
  }

  return (
    <WorkoutScheduleProvider>
      <CoachSelectionProvider>
        <Router>
          <AppRoutes />
          <RecapToast />
          <RecapModal />
        </Router>
      </CoachSelectionProvider>
    </WorkoutScheduleProvider>
  );
}

export default App;