import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MissionRouteState.module.css';
import type { MissionSurfaceState } from '../../store/missionFlow/routeState';
import { missionSeverityIcons } from '../../utils/mission/iconography';

type Props = {
  state: Exclude<MissionSurfaceState, { kind: 'ready' }>;
};

const MissionRouteState: React.FC<Props> = ({ state }) => {
  const navigate = useNavigate();
  const severityIcon = state.kind === 'error'
    ? missionSeverityIcons.critical
    : state.kind === 'empty'
      ? missionSeverityIcons.medium
      : missionSeverityIcons.low;

  if (state.kind === 'loading') {
    return (
      <div className={styles.card} data-tone="loading" role="status" aria-live="polite">
        <h3 className={styles.title}>{severityIcon} {state.title}</h3>
        <p className={styles.body}>{state.body}</p>
        <div className={styles.skeleton}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card} data-tone={state.kind} role={state.kind === 'error' ? 'alert' : 'status'}>
      <h3 className={styles.title}>{severityIcon} {state.title}</h3>
      <p className={styles.body}>{state.body}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => navigate(state.actionPath)}>
          {state.actionLabel}
        </button>
      </div>
    </div>
  );
};

export default MissionRouteState;
