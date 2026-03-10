import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CardSlugRedirect from './CardSlugRedirect';
import MissionShell from '../pages/MissionFlow/MissionShell';
import MissionEntryRedirect from '../pages/MissionFlow/MissionEntryRedirect';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import SurfaceLoader from '../components/SurfaceLoader/SurfaceLoader';
import {
  getDefaultRootPath,
  resolveLegacyAliasPath,
} from './missionCutover';

/* ── Lazy-loaded mission surfaces ── */
const BriefSurface = lazy(() => import('../pages/MissionFlow/BriefSurface'));
const TriageSurface = lazy(() => import('../pages/MissionFlow/TriageSurface'));
const CaseSurface = lazy(() => import('../pages/MissionFlow/CaseSurface'));
const SignalSurface = lazy(() => import('../pages/MissionFlow/SignalSurface'));
const ChecklistSurface = lazy(() => import('../pages/MissionFlow/ChecklistSurface'));
const DebriefSurface = lazy(() => import('../pages/MissionFlow/DebriefSurface'));
const StatsSurface = lazy(() => import('../pages/MissionFlow/StatsSurface'));

/* ── Lazy-loaded auxiliary pages ── */
const CardSharePage = lazy(() => import('../pages/CardSharePage/CardSharePage'));

/** Wrap a lazy surface in Suspense + route-level error boundary */
const Surface: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary level="route">
    <Suspense fallback={<SurfaceLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AppRoutes: React.FC = () => {
  const defaultRoot = getDefaultRootPath();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoot} replace />} />

      <Route path="/home" element={<Navigate to="/mission/brief" replace />} />
      <Route path="/home/plan" element={<Navigate to="/mission/brief" replace />} />
      <Route path="/home/cards" element={<Navigate to="/mission/triage" replace />} />
      <Route path="/home/progress" element={<Navigate to="/mission/case" replace />} />
      <Route path="/home/handler" element={<Navigate to="/mission/signal" replace />} />
      <Route path="/home/settings" element={<Navigate to="/mission/debrief" replace />} />

      <Route path="/mission" element={<MissionShell />}>
        <Route index element={<MissionEntryRedirect />} />
        <Route path="brief" element={<Surface><BriefSurface /></Surface>} />
        <Route path="triage" element={<Surface><TriageSurface /></Surface>} />
        <Route path="case" element={<Surface><CaseSurface /></Surface>} />
        <Route path="signal" element={<Surface><SignalSurface /></Surface>} />
        <Route path="checklist" element={<Surface><ChecklistSurface /></Surface>} />
        <Route path="debrief" element={<Surface><DebriefSurface /></Surface>} />
        <Route path="stats" element={<Surface><StatsSurface /></Surface>} />
      </Route>

      <Route path="/schedules" element={<Navigate to={resolveLegacyAliasPath('/schedules')} replace />} />
      <Route path="/drills" element={<Navigate to={resolveLegacyAliasPath('/drills')} replace />} />
      <Route path="/training" element={<Navigate to={resolveLegacyAliasPath('/training')} replace />} />
      <Route path="/training/run" element={<Navigate to={resolveLegacyAliasPath('/training/run')} replace />} />
      <Route path="/settings" element={<Navigate to={resolveLegacyAliasPath('/settings')} replace />} />

      <Route path="/c/:slug" element={<CardSlugRedirect />} />
      <Route path="/share/:slug" element={<Surface><CardSharePage /></Surface>} />
      <Route path="*" element={<Navigate to={defaultRoot} replace />} />
    </Routes>
  );
};

export default AppRoutes;