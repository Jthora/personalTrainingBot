import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { buildMissionUrlState, readMissionFlowContext } from '../../store/missionFlow/continuity';
import { buildTimelineEvents } from './model';
import styles from './TimelineBand.module.css';

const TimelineBand: React.FC = () => {
  const collection = useMissionEntityCollection();
  const context = readMissionFlowContext();

  const events = useMemo(() => buildTimelineEvents(collection, context), [collection, context?.updatedAt]);
  const search = context ? buildMissionUrlState(context) : '';

  if (events.length === 0) {
    return <p className={styles.empty}>No timeline events available for the current mission context.</p>;
  }

  return (
    <section className={styles.panel} aria-label="Timeline band">
      <h3 className={styles.title}>Timeline</h3>
      <ul className={styles.list}>
        {events.map((event) => (
          <li key={event.id} className={styles.item}>
            <span className={styles.marker} aria-hidden="true">{event.marker}</span>
            <div className={styles.content}>
              <p className={styles.itemTitle}>{event.label}</p>
              <p className={styles.itemMeta}>{new Date(event.timestamp).toLocaleString()}</p>
            </div>
            <Link className={styles.jump} to={{ pathname: event.path, search: search ? `?${search}` : '' }}>
              Jump
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TimelineBand;