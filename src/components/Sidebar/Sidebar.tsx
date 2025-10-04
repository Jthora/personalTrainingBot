import React from 'react';
import CoachDialog from '../CoachDialog/CoachDialog';
import WorkoutList from '../WorkoutList/WorkoutList';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {

    return (
        <div className={styles.sidebar}>
            <CoachDialog />
            <WorkoutList />
        </div>
    );
};

export default Sidebar;