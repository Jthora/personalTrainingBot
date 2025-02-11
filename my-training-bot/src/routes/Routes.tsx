import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import WorkoutPlannerPage from '../pages/WorkoutPlannerPage/WorkoutPlannerPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import SchedulePage from '../pages/SchedulePage/SchedulePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/workout-planner" element={<WorkoutPlannerPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
    </Routes>
  );
};

export default AppRoutes;