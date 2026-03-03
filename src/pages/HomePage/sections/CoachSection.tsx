import React from 'react';
import CoachDialog from '../../../components/CoachDialog/CoachDialog';
import styles from './CoachSection.module.css';

const CoachSection: React.FC = () => {
    return (
        <section id="section-coach" aria-label="Coach" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Coach</h2>
                <p className={styles.body}>Choose your coach, get alignment guidance, and pick up fresh motivation.</p>
            </div>
            <div className={styles.card}><CoachDialog /></div>
        </section>
    );
};

export default CoachSection;
