import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TodaysPlanBanner from '../../../components/TodaysPlanBanner/TodaysPlanBanner';
import UpNextCard from '../../../components/UpNextCard/UpNextCard';
import WorkoutList from '../../../components/WorkoutList/WorkoutList';
import styles from './PlanSection.module.css';
import { trackEvent } from '../../../utils/telemetry';
import ReadinessPanel from '../../../components/Readiness/ReadinessPanel';
import MissionKitPanel from '../../../components/MissionKit/MissionKitPanel';
import { getMissionSurfaceState } from '../../../store/missionFlow/routeState';
import MissionRouteState from '../../../components/MissionRouteState/MissionRouteState';

const PLAN_MODE_KEY = 'planMode';

const PlanSection: React.FC = () => {
    const [params, setParams] = useSearchParams();
    const mode = params.get('mode') ?? 'overview';

    useEffect(() => {
        if (params.get('mode')) return;
        const saved = localStorage.getItem(PLAN_MODE_KEY);
        if (saved === 'focus') {
            // Persist focus preference, but do not auto-navigate; keep users on Home unless they explicitly choose focus.
            setParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('mode', 'focus');
                return next;
            }, { replace: true });
        }
    }, [params, setParams]);

    useEffect(() => {
        if (mode === 'focus') {
            localStorage.setItem(PLAN_MODE_KEY, 'focus');
            return;
        }
        localStorage.setItem(PLAN_MODE_KEY, 'overview');
    }, [mode]);

    const setMode = (nextMode: 'overview' | 'focus') => {
        trackEvent({ category: 'ia', action: 'tab_view', route: nextMode === 'focus' ? '/mission/brief?mode=focus' : '/mission/brief', data: { tab: '/mission/brief', mode: nextMode, source: 'mode-switch' } });
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('mode', nextMode);
            return next;
        }, { replace: true });
    };

    const routeState = getMissionSurfaceState('brief');
    if (routeState.kind !== 'ready') {
        return (
            <section id="section-mission-kit" aria-label="Mission kit" className={styles.section}>
                <MissionRouteState state={routeState} />
            </section>
        );
    }

    return (
        <section id="section-mission-kit" aria-label="Mission kit" className={styles.section}>
            <ReadinessPanel />
            <div className={styles.modeBar}>
                <span className={styles.modeLabel}>Execution mode</span>
                <div className={styles.modeButtons} role="group" aria-label="Mission flow mode">
                    <button
                        type="button"
                        className={`${styles.modeButton} ${mode === 'overview' ? styles.modeButtonActive : ''}`}
                        onClick={() => setMode('overview')}
                        aria-pressed={mode === 'overview'}
                    >
                        Briefing
                    </button>
                    <button
                        type="button"
                        className={`${styles.modeButton} ${mode === 'focus' ? styles.modeButtonActive : ''}`}
                        onClick={() => setMode('focus')}
                        aria-pressed={mode === 'focus'}
                    >
                        Execute
                    </button>
                </div>
                <p className={styles.modeHelp}>Briefing keeps you planning in the hub; Execute jumps straight into drills.</p>
            </div>
            <div className={styles.grid}>
                <div className={styles.main}>
                    <TodaysPlanBanner />
                    <UpNextCard />
                    <div className={styles.listCard}>
                        <WorkoutList />
                    </div>
                </div>
                <div className={styles.side}>
                    <MissionKitPanel />
                </div>
            </div>
        </section>
    );
};

export default PlanSection;
