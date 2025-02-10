import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import InitialDataLoader from './utils/InitialDataLoader';

function App() {
  useEffect(() => {
    const initializeData = async () => {
      await InitialDataLoader.initialize();
    };

    initializeData();
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;