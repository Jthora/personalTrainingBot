import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MissionKitStore } from '../../store/MissionKitStore';
import styles from './MissionKitPanel.module.css';
import { DrillRunStore } from '../../store/DrillRunStore';

const difficultyLabels = ['I', 'II', 'III', 'IV', 'V'];

const MissionKitPanel: React.FC = () => {
  const kit = useMemo(() => MissionKitStore.getPrimaryKit(), []);
  const [visible, setVisible] = useState(() => MissionKitStore.isVisible());
  const navigate = useNavigate();

  const startDrill = (drillId: string, title: string, steps?: Array<{ id: string; label: string; cardId?: string; routePath?: string }>) => {
    DrillRunStore.start(drillId, title, [
      ...(steps ?? [
        { id: `${drillId}-prep`, label: 'Prep: review scenario' },
        { id: `${drillId}-execute`, label: 'Execute: run drill' },
        { id: `${drillId}-debrief`, label: 'Debrief: capture notes' },
      ]),
    ]);
    navigate('/training/run');
  };

  if (!kit || !visible) {
    return (
      <div className={styles.hiddenCard}>
        <div>
          <p className={styles.hiddenTitle}>Mission kit is hidden</p>
          <p className={styles.hiddenBody}>Use the toggle below to resurface the starter kit and drills.</p>
        </div>
        <button type="button" className={styles.toggle} onClick={() => setVisible(MissionKitStore.setVisible(true))}>
          Show kit
        </button>
      </div>
    );
  }

  return (
    <section className={styles.panel} aria-label="Mission kit">
      <header className={styles.header}>
        <div>
          <p className={styles.label}>Mission kit</p>
          <h3 className={styles.title}>{kit.title}</h3>
          <p className={styles.synopsis}>{kit.synopsis}</p>
        </div>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible(MissionKitStore.toggleVisible())}
          aria-pressed={visible}
        >
          Hide kit
        </button>
      </header>

      <ul className={styles.drillList} aria-label="Drills">
        {kit.drills.map((drill) => (
          <li key={drill.id} className={styles.drillCard}>
            <div className={styles.drillHeader}>
              <span className={styles.drillType}>{drill.type}</span>
              <span className={styles.badge}>D{difficultyLabels[drill.difficulty - 1]}</span>
            </div>
            <p className={styles.drillTitle}>{drill.title}</p>
            <div className={styles.metaRow}>
              <span>{drill.durationMinutes} min</span>
              {drill.lastCompleted ? <span>Last: {new Date(drill.lastCompleted).toLocaleDateString()}</span> : <span>New</span>}
            </div>
            <button type="button" className={styles.runButton} onClick={() => startDrill(drill.id, drill.title, drill.steps)}>
              Run offline
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MissionKitPanel;
