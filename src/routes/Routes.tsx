import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CardSlugRedirect from './CardSlugRedirect';
import MissionEntryRedirect from '../pages/MissionFlow/MissionEntryRedirect';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import SurfaceLoader from '../components/SurfaceLoader/SurfaceLoader';
import NotFound from '../pages/NotFound/NotFound';
import TrainingSurfaceSkeleton from '../pages/MissionFlow/TrainingSurfaceSkeleton';
import ReviewDashboardSkeleton from '../pages/AppShell/ReviewDashboardSkeleton';
import ProfileSurfaceSkeleton from '../pages/AppShell/ProfileSurfaceSkeleton';

/* ── Lazy-loaded app shell (single unified shell) ── */
const AppShell = lazy(() => import('../pages/AppShell/AppShell'));
const MissionLayout = lazy(() => import('../pages/MissionFlow/MissionLayout'));

/* ── Lazy-loaded primary surfaces ── */
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
const Surface: React.FC<{ children: React.ReactNode; skeleton?: React.ReactNode }> = ({ children, skeleton }) => (
  <ErrorBoundary level="route">
    <Suspense fallback={skeleton ?? <SurfaceLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/train" replace />} />

      {/* ── Unified shell — all routes under AppShell ── */}
      <Route path="/" element={<Suspense fallback={<SurfaceLoader />}><AppShell /></Suspense>}>
        {/* Primary surfaces */}
        <Route path="train" element={<Surface skeleton={<TrainingSurfaceSkeleton />}><TrainingSurface /></Surface>} />
        <Route path="train/quiz" element={<Surface><QuizSurface /></Surface>} />
        <Route path="review" element={<Surface skeleton={<ReviewDashboardSkeleton />}><ReviewDashboard /></Surface>} />
        <Route path="progress" element={<Surface><StatsSurface /></Surface>} />
        <Route path="profile" element={<Surface skeleton={<ProfileSurfaceSkeleton />}><ProfileSurface /></Surface>} />

        {/* Mission surfaces — nested layout adds mission chrome */}
        <Route path="mission" element={<Suspense fallback={<SurfaceLoader />}><MissionLayout /></Suspense>}>
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
      </Route>

      {/* ── Legacy alias redirects ── */}
      <Route path="/schedules" element={<Navigate to="/mission/brief" replace />} />
      <Route path="/drills" element={<Navigate to="/mission/triage" replace />} />
      <Route path="/training" element={<Navigate to="/mission/training" replace />} />
      <Route path="/training/run" element={<Navigate to="/mission/training" replace />} />
      <Route path="/settings" element={<Navigate to="/mission/debrief" replace />} />

      {/* ── Legacy /home redirects (consolidated) ── */}
      <Route path="/home/*" element={<Navigate to="/train" replace />} />

      <Route path="/c/:slug" element={<CardSlugRedirect />} />
      <Route path="/share/:slug" element={<Surface><CardSharePage /></Surface>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;