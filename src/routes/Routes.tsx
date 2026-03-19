import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CardSlugRedirect from './CardSlugRedirect';
import MissionEntryRedirect from '../pages/MissionFlow/MissionEntryRedirect';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import SurfaceLoader from '../components/SurfaceLoader/SurfaceLoader';
import {
  resolveLegacyAliasPath,
} from './missionCutover';
import { isFeatureEnabled } from '../config/featureFlags';

/* ── Lazy-loaded v1 mission shell ── */
const MissionShell = lazy(() => import('../pages/MissionFlow/MissionShell'));

/* ── Lazy-loaded v2 app shell ── */
const AppShell = lazy(() => import('../pages/AppShell/AppShell'));
const ReviewDashboard = lazy(() => import('../pages/AppShell/ReviewDashboard'));
const ProfileSurface = lazy(() => import('../pages/AppShell/ProfileSurface'));

/* ── Lazy-loaded mission surfaces ── */
const BriefSurface = lazy(() => import('../pages/MissionFlow/BriefSurface'));
const TriageSurface = lazy(() => import('../pages/MissionFlow/TriageSurface'));
const CaseSurface = lazy(() => import('../pages/MissionFlow/CaseSurface'));
const SignalSurface = lazy(() => import('../pages/MissionFlow/SignalSurface'));
const ChecklistSurface = lazy(() => import('../pages/MissionFlow/ChecklistSurface'));
const DebriefSurface = lazy(() => import('../pages/MissionFlow/DebriefSurface'));
const StatsSurface = lazy(() => import('../pages/MissionFlow/StatsSurface'));
const PlanSurface = lazy(() => import('../pages/MissionFlow/PlanSurface'));
const TrainingSurface = lazy(() => import('../pages/MissionFlow/TrainingSurface'));
const QuizSurface = lazy(() => import('../pages/MissionFlow/QuizSurface'));

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
  const shellV2 = isFeatureEnabled('shellV2');
  const defaultRoot = '/train';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoot} replace />} />

      {/* ── v2 shell routes ── */}
      {shellV2 && (
        <Route path="/" element={<Suspense fallback={<SurfaceLoader />}><AppShell /></Suspense>}>
          <Route path="train" element={<Surface><TrainingSurface /></Surface>} />
          <Route path="train/quiz" element={<Surface><QuizSurface /></Surface>} />
          <Route path="review" element={<Surface><ReviewDashboard /></Surface>} />
          <Route path="progress" element={<Surface><StatsSurface /></Surface>} />
          <Route path="profile" element={<Surface><ProfileSurface /></Surface>} />
        </Route>
      )}

      {/* ── Legacy /home redirects ── */}
      <Route path="/home" element={<Navigate to={shellV2 ? '/train' : '/mission/brief'} replace />} />
      <Route path="/home/plan" element={<Navigate to={shellV2 ? '/train' : '/mission/brief'} replace />} />
      <Route path="/home/cards" element={<Navigate to={shellV2 ? '/train' : '/mission/triage'} replace />} />
      <Route path="/home/progress" element={<Navigate to={shellV2 ? '/progress' : '/mission/case'} replace />} />
      <Route path="/home/handler" element={<Navigate to={shellV2 ? '/profile' : '/mission/signal'} replace />} />
      <Route path="/home/settings" element={<Navigate to={shellV2 ? '/profile' : '/mission/debrief'} replace />} />

      {/* ── v1 mission shell (always mounted — routes always accessible) ── */}
      <Route path="/mission" element={<Suspense fallback={<SurfaceLoader />}><MissionShell /></Suspense>}>
        <Route index element={<MissionEntryRedirect />} />
        <Route path="brief" element={<Surface><BriefSurface /></Surface>} />
        <Route path="triage" element={<Surface><TriageSurface /></Surface>} />
        <Route path="case" element={<Surface><CaseSurface /></Surface>} />
        <Route path="signal" element={<Surface><SignalSurface /></Surface>} />
        <Route path="checklist" element={<Surface><ChecklistSurface /></Surface>} />
        <Route path="debrief" element={<Surface><DebriefSurface /></Surface>} />
        <Route path="stats" element={<Surface><StatsSurface /></Surface>} />
        <Route path="plan" element={<Surface><PlanSurface /></Surface>} />
        <Route path="training" element={<Surface><TrainingSurface /></Surface>} />
        <Route path="quiz" element={<Surface><QuizSurface /></Surface>} />
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