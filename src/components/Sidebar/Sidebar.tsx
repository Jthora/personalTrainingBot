import React from 'react';
import CoachDialog from '../CoachDialog/CoachDialog';
import WorkoutList from '../WorkoutList/WorkoutList';
import ProgressWidget from '../ProgressWidget/ProgressWidget';
import UpNextCard from '../UpNextCard/UpNextCard';
import BadgeStrip from '../BadgeStrip/BadgeStrip';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {

    return (
        <div className={styles.sidebar}>
            <CoachDialog />
            <ProgressWidget />
            <UpNextCard />
            <BadgeStrip />
            <WorkoutList />
        </div>
    );
};

export default Sidebar;