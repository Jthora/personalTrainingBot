import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import WorkoutsPage from '../pages/WorkoutsPage/WorkoutsPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import TrainingPage from '../pages/TrainingPage/TrainingPage';
import SchedulesPage from '../pages/SchedulesPage/SchedulesPage';
import CardSharePage from '../pages/CardSharePage/CardSharePage';
import CardSlugRedirect from './CardSlugRedirect';
import HomeShell from '../pages/HomePage/HomeShell';
import PlanSection from '../pages/HomePage/sections/PlanSection';
import CardsSection from '../pages/HomePage/sections/CardsSection';
import ProgressSection from '../pages/HomePage/sections/ProgressSection';
import CoachSection from '../pages/HomePage/sections/CoachSection';
import SettingsSection from '../pages/HomePage/sections/SettingsSection';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home/plan" replace />} />
      <Route path="/home" element={<HomeShell />}>
        <Route index element={<Navigate to="/home/plan" replace />} />
        <Route path="plan" element={<PlanSection />} />
        <Route path="cards" element={<CardsSection />} />
        <Route path="progress" element={<ProgressSection />} />
        <Route path="coach" element={<CoachSection />} />
        <Route path="settings" element={<SettingsSection />} />
      </Route>
      <Route path="/schedules" element={<SchedulesPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/c/:slug" element={<CardSlugRedirect />} />
      <Route path="/share/:slug" element={<CardSharePage />} />
    </Routes>
  );
};

export default AppRoutes;