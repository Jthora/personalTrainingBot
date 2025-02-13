import { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import InitialDataLoader from './utils/InitialDataLoader';
import LoadingMessage from './components/LoadingMessage/LoadingMessage'; // Import the new component
import { WorkoutScheduleProvider } from './context/WorkoutScheduleContext';

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

  if (!isDataLoaded) {
    return <LoadingMessage progress={loadingProgress} />; // Use the new component with progress
  }

  return (
    <WorkoutScheduleProvider>
      <Router>
        <AppRoutes />
      </Router>
    </WorkoutScheduleProvider>
  );
}

export default App;