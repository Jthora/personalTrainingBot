import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import DataLoader from './utils/DataLoader';

function App() {
  useEffect(() => {
    const loadData = async () => {
      const dataLoader = new DataLoader();
      await dataLoader.loadAllData();
    };

    loadData();
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;