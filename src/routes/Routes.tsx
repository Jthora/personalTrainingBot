import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CardSharePage from '../pages/CardSharePage/CardSharePage';
import CardSlugRedirect from './CardSlugRedirect';
import HomeShell from '../pages/HomePage/HomeShell';
import PlanSection from '../pages/HomePage/sections/PlanSection';
import CardsSection from '../pages/HomePage/sections/CardsSection';
import ProgressSection from '../pages/HomePage/sections/ProgressSection';
import CoachSection from '../pages/HomePage/sections/CoachSection';
import SettingsSection from '../pages/HomePage/sections/SettingsSection';
import MissionShell from '../pages/MissionFlow/MissionShell';
import ChecklistSurface from '../pages/MissionFlow/ChecklistSurface';
import DebriefSurface from '../pages/MissionFlow/DebriefSurface';
import MissionEntryRedirect from '../pages/MissionFlow/MissionEntryRedirect';
import { isFeatureEnabled } from '../config/featureFlags';
import {
  getDefaultRootPath,
  isMissionRouteEnabled,
  resolveLegacyAliasPath,
  toHomeFallbackPath,
  type MissionRoutePath,
} from './missionCutover';

const AppRoutes: React.FC = () => {
  const missionDefaultRoutes = isFeatureEnabled('missionDefaultRoutes');
  const defaultRoot = getDefaultRootPath();

  const missionSurface = (route: MissionRoutePath, element: React.ReactNode) => {
    if (isMissionRouteEnabled(route)) {
      return element;
    }

    return <Navigate to={toHomeFallbackPath(route)} replace />;
  };

  const missionShellElement = missionDefaultRoutes
    ? <MissionShell />
    : <Navigate to="/home/plan" replace />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoot} replace />} />

      <Route path="/home" element={<HomeShell />}>
        <Route index element={<Navigate to="/home/plan" replace />} />
        <Route path="plan" element={<PlanSection />} />
        <Route path="cards" element={<CardsSection />} />
        <Route path="progress" element={<ProgressSection />} />
        <Route path="coach" element={<CoachSection />} />
        <Route path="settings" element={<SettingsSection />} />
      </Route>

      <Route path="/mission" element={missionShellElement}>
        <Route
          index
          element={missionDefaultRoutes ? <MissionEntryRedirect /> : <Navigate to="/home/plan" replace />}
        />
        <Route path="brief" element={missionSurface('/mission/brief', <PlanSection />)} />
        <Route path="triage" element={missionSurface('/mission/triage', <CardsSection />)} />
        <Route path="case" element={missionSurface('/mission/case', <ProgressSection />)} />
        <Route path="signal" element={missionSurface('/mission/signal', <CoachSection />)} />
        <Route path="checklist" element={missionSurface('/mission/checklist', <ChecklistSurface />)} />
        <Route path="debrief" element={missionSurface('/mission/debrief', <DebriefSurface />)} />
      </Route>

      <Route path="/schedules" element={<Navigate to={resolveLegacyAliasPath('/schedules')} replace />} />
      <Route path="/workouts" element={<Navigate to={resolveLegacyAliasPath('/workouts')} replace />} />
      <Route path="/training" element={<Navigate to={resolveLegacyAliasPath('/training')} replace />} />
      <Route path="/training/run" element={<Navigate to={resolveLegacyAliasPath('/training/run')} replace />} />
      <Route path="/settings" element={<Navigate to={resolveLegacyAliasPath('/settings')} replace />} />

      <Route path="/c/:slug" element={<CardSlugRedirect />} />
      <Route path="/share/:slug" element={<CardSharePage />} />
      <Route path="*" element={<Navigate to={defaultRoot} replace />} />
    </Routes>
  );
};

export default AppRoutes;