import React from 'react';
import styles from './SchedulesSidebar.module.css';

const SchedulesSidebar: React.FC = () => {

    return (
        <div className={styles.schedulesSidebar}>
            <div className={styles.scrollableContent}>
                <h2>Schedules</h2>
            </div>
        </div>
    );
};

export default SchedulesSidebar;

