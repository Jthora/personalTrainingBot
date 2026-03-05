import React from 'react';
import styles from './CoachSection.module.css';
import SignalsPanel from '../../../components/Signals/SignalsPanel';
import AARComposer from '../../../components/AAR/AARComposer';
import { getMissionSurfaceState } from '../../../store/missionFlow/routeState';
import MissionRouteState from '../../../components/MissionRouteState/MissionRouteState';
import AlertStream from '../../../components/AlertStream/AlertStream';
import TimelineBand from '../../../components/TimelineBand/TimelineBand';

const CoachSection: React.FC = () => {
    const routeState = getMissionSurfaceState('signal');
    if (routeState.kind !== 'ready') {
        return (
            <section id="section-coach" aria-label="Signals and Ops Brief" className={styles.section}>
                <MissionRouteState state={routeState} />
            </section>
        );
    }

    return (
        <section id="section-coach" aria-label="Signals and Ops Brief" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Signals / Ops Brief</h2>
                <p className={styles.body}>Track coordination items, acknowledge/resolve them, and log an AAR for the latest drills.</p>
            </div>
            <div className={styles.grid}>
                <div className={styles.card}><AlertStream /></div>
                <div className={styles.card}><TimelineBand /></div>
                <div className={styles.card}><SignalsPanel /></div>
                <div className={styles.card}><AARComposer /></div>
            </div>
        </section>
    );
};

export default CoachSection;
