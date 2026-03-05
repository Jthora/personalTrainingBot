import React from 'react';
import ProgressWidget from '../../../components/ProgressWidget/ProgressWidget';
import BadgeStrip from '../../../components/BadgeStrip/BadgeStrip';
import styles from './ProgressSection.module.css';
import { getMissionSurfaceState } from '../../../store/missionFlow/routeState';
import MissionRouteState from '../../../components/MissionRouteState/MissionRouteState';
import { missionEntityIcons } from '../../../utils/mission/iconography';
import ArtifactList from '../../../components/ArtifactList/ArtifactList';

const ProgressSection: React.FC = () => {
    const routeState = getMissionSurfaceState('case');
    if (routeState.kind !== 'ready') {
        return (
            <section id="section-progress" aria-label="Readiness" className={styles.section}>
                <MissionRouteState state={routeState} />
            </section>
        );
    }

    return (
        <section id="section-progress" aria-label="Readiness" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{missionEntityIcons.operation} Case Detail</h2>
                <p className={styles.body}>Streaks, XP, and badges as signals. Informational only—plan changes live in Mission Kit.</p>
            </div>
            <div className={styles.grid}>
                <div className={styles.tile}><ProgressWidget /></div>
                <div className={styles.tile}><BadgeStrip /></div>
            </div>
            <div className={styles.tile}>
                <ArtifactList />
            </div>
        </section>
    );
};

export default ProgressSection;
