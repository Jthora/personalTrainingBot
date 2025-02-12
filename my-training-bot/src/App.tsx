import { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import InitialDataLoader from './utils/InitialDataLoader';
import LoadingMessage from './components/LoadingMessage/LoadingMessage'; // Import the new component
import { WorkoutScheduleProvider } from './context/WorkoutScheduleContext';

const App: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Add loading progress state

  useEffect(() => {
    const initializeData = async () => {
      await InitialDataLoader.initialize((progress) => setLoadingProgress(progress)); // Pass progress callback
      setIsDataLoaded(true);
    };

    initializeData();
  }, []);

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