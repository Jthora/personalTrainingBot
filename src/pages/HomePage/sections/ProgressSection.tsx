import React from 'react';
import ProgressWidget from '../../../components/ProgressWidget/ProgressWidget';
import BadgeStrip from '../../../components/BadgeStrip/BadgeStrip';
import styles from './ProgressSection.module.css';

const ProgressSection: React.FC = () => {
    return (
        <section id="section-progress" aria-label="Progress" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Progress</h2>
                <p className={styles.body}>Track streaks, XP, goals, and badges. Informational only—no plan changes here.</p>
            </div>
            <div className={styles.grid}>
                <div className={styles.tile}><ProgressWidget /></div>
                <div className={styles.tile}><BadgeStrip /></div>
            </div>
        </section>
    );
};

export default ProgressSection;
