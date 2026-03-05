import React from 'react';
import Header from '../../components/Header/Header';
import DrillRunner from '../../components/DrillRunner/DrillRunner';
import styles from './DrillRunPage.module.css';

const DrillRunPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Offline continuity</p>
          <h1 className={styles.title}>Drill Run</h1>
          <p className={styles.body}>Start or resume a cached drill. Progress and events stay on this device and queue until you go back online.</p>
        </div>
        <DrillRunner />
      </main>
    </div>
  );
};

export default DrillRunPage;
