import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import WorkoutsPage from '../pages/WorkoutsPage/WorkoutsPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import TrainingPage from '../pages/TrainingPage/TrainingPage';
import SchedulesPage from '../pages/SchedulesPage/SchedulesPage'; // Import the new page
import CardSharePage from '../pages/CardSharePage/CardSharePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/schedules" element={<SchedulesPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/c/:slug" element={<CardSharePage />} />
    </Routes>
  );
};

export default AppRoutes;