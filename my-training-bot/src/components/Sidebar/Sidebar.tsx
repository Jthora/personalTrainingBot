import React, { useState } from 'react'; 
import CoachDialog from '../CoachDialog/CoachDialog'; 
import SubWorkoutList from '../SubWorkoutList/SubWorkoutList'; 
import styles from './Sidebar.module.css';
import { SubWorkout } from '../../types/SubWorkout';

const Sidebar: React.FC = () => {
    const [currentWorkout, setCurrentWorkout] = useState<SubWorkout | null>(null);

    const handleCompleteWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleSkipWorkout = () => {
        setCurrentWorkout(null);
    };

    return (
        <div className={styles.sidebar}>
            <CoachDialog currentWorkout={currentWorkout} onComplete={handleCompleteWorkout} onSkip={handleSkipWorkout} />
            <SubWorkoutList onWorkoutComplete={setCurrentWorkout} />
        </div>
    );
};

export default Sidebar;