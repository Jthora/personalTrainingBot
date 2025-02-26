import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import SchedulesSidebar from '../../components/SchedulesSidebar/SchedulesSidebar';
import SchedulesWindow from '../../components/SchedulesWindow/SchedulesWindow';
import styles from './SchedulesPage.module.css';

const SchedulesPage: React.FC = () => {
    const [scheduleUpdated, setScheduleUpdated] = useState(false);

    const handleScheduleUpdate = () => {
        setScheduleUpdated(!scheduleUpdated);
    };

    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.contentContainer}>
                <div className={styles.schedulesWindowContainer}>
                    <SchedulesWindow onScheduleUpdate={handleScheduleUpdate} />
                </div>
                <div className={styles.schedulesSidebarContainer}>
                    <SchedulesSidebar key={scheduleUpdated} scheduleUpdated={scheduleUpdated} />
                </div>
            </div>
        </div>
    );
};

export default SchedulesPage;
