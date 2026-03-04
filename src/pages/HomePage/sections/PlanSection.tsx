import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TodaysPlanBanner from '../../../components/TodaysPlanBanner/TodaysPlanBanner';
import UpNextCard from '../../../components/UpNextCard/UpNextCard';
import WorkoutList from '../../../components/WorkoutList/WorkoutList';
import styles from './PlanSection.module.css';
import { logEvent } from '../../../utils/telemetry';

const PLAN_MODE_KEY = 'planMode';

const PlanSection: React.FC = () => {
    const navigate = useNavigate();
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
        logEvent({ type: 'home_tab_switch', tab: nextMode === 'focus' ? '/home/plan?mode=focus' : '/home/plan' });
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('mode', nextMode);
            return next;
        }, { replace: true });
    };

    return (
        <section id="section-plan" aria-label="Plan" className={styles.section}>
            <div className={styles.modeBar}>
                <span className={styles.modeLabel}>Mode</span>
                <div className={styles.modeButtons} role="group" aria-label="Plan mode">
                    <button
                        type="button"
                        className={`${styles.modeButton} ${mode === 'overview' ? styles.modeButtonActive : ''}`}
                        onClick={() => setMode('overview')}
                        aria-pressed={mode === 'overview'}
                    >
                        Overview
                    </button>
                    <button
                        type="button"
                        className={`${styles.modeButton} ${mode === 'focus' ? styles.modeButtonActive : ''}`}
                        onClick={() => setMode('focus')}
                        aria-pressed={mode === 'focus'}
                    >
                        Focus mode
                    </button>
                </div>
                <p className={styles.modeHelp}>Focus mode jumps into Training; Overview keeps you in planning.</p>
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
                    <div className={styles.infoCard}>
                        <h2 className={styles.title}>Stay aligned</h2>
                        <p className={styles.body}>Plan is your single source of truth. Start or resume training here and regenerate the plan when focus shifts.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlanSection;
