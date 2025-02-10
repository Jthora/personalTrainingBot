import React, { useEffect, useState } from 'react';
import CoachDialog from '../CoachDialog/CoachDialog';
import SubWorkoutList from '../SubWorkoutList/SubWorkoutList';
import styles from './Sidebar.module.css';
import { useWorkoutSchedule } from '../../hooks/useWorkoutSchedule';
import { SubWorkout } from '../../types/SubWorkout';

const Sidebar: React.FC = () => {
    const { schedule } = useWorkoutSchedule();
    const [currentWorkout, setCurrentWorkout] = useState<SubWorkout | null>(schedule[0] || null);

    useEffect(() => {
        setCurrentWorkout(schedule[0] || null);
    }, [schedule]);

    const handleCompleteWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleSkipWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleWorkoutComplete = () => {
        setCurrentWorkout(schedule[0] || null);
    };

    return (
        <div className={styles.sidebar}>
            <CoachDialog 
                currentWorkout={currentWorkout} 
                onComplete={handleCompleteWorkout} 
                onSkip={handleSkipWorkout} 
            />
            <SubWorkoutList onWorkoutComplete={handleWorkoutComplete} />
        </div>
    );
};

export default Sidebar;