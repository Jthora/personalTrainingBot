import React from 'react';
import Header from '../../components/Header/Header';
import SchedulesSidebar from '../../components/SchedulesSidebar/SchedulesSidebar';
import SchedulesWindow from '../../components/SchedulesWindow/SchedulesWindow';
import styles from './SchedulesPage.module.css';

const SchedulesPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.contentContainer}>
                <div className={styles.schedulesWindowContainer}>
                    <SchedulesWindow />
                </div>
                <div className={styles.schedulesSidebarContainer}>
                    <SchedulesSidebar />
                </div>
            </div>
        </div>
    );
};

export default SchedulesPage;
