import React, { useMemo } from 'react';
import MissionEntityStore from '../../domain/mission/MissionEntityStore';
import styles from './AlertStream.module.css';
import { buildAlertGroups } from './model';
import { missionSeverityIcons } from '../../utils/mission/iconography';

const AlertStream: React.FC = () => {
  const collection = MissionEntityStore.getInstance().getCanonicalCollection();
  const groups = useMemo(() => buildAlertGroups(collection?.signals ?? []), [collection]);

  return (
    <section className={styles.panel} aria-label="Alert stream">
      <h3 className={styles.title}>Alert Stream</h3>

      {groups.length === 0 ? (
        <p className={styles.empty}>No alerts available for this mission context.</p>
      ) : (
        groups.map((group) => (
          <article key={group.id} className={styles.group} aria-label={group.label}>
            <div className={styles.groupHeader}>
              <span aria-hidden>{missionSeverityIcons[group.severity]}</span>
              <span>{group.label}</span>
            </div>

            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemBody}>{item.detail}</p>
                  <p className={styles.itemMeta}>
                    {new Date(item.observedAt).toLocaleString()}
                    <span className={styles.status}>· {item.status}</span>
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))
      )}
    </section>
  );
};

export default AlertStream;