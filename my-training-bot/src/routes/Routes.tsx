import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import WorkoutsPage from '../pages/WorkoutsPage/WorkoutsPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import TrainingPage from '../pages/TrainingPage/TrainingPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/training" element={<TrainingPage />} />
    </Routes>
  );
};

export default AppRoutes;