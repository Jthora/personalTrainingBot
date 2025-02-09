import React, { useState } from 'react'; 
import CoachDialog from '../CoachDialog/CoachDialog'; 
import WorkoutList from '../WorkoutList/WorkoutList'; 
import styles from './Sidebar.module.css';
import { Workout } from '../../types/Workout';

const Sidebar: React.FC = () => {
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);

    const handleCompleteWorkout = () => {
        setCurrentWorkout(null);
    };

    return (
        <div className={styles.sidebar}>
            <CoachDialog currentWorkout={currentWorkout} onComplete={handleCompleteWorkout} />
            <WorkoutList />
        </div>
    );
};

export default Sidebar;