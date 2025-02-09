import React, { useState, useEffect } from 'react'; 
import CoachDialog from '../CoachDialog/CoachDialog'; 
import SubWorkoutList from '../SubWorkoutList/SubWorkoutList'; 
import styles from './Sidebar.module.css';
import { SubWorkout } from '../../types/SubWorkout';
import coachTrainingCache from '../../cache/CoachTrainingCache';

const Sidebar: React.FC = () => {
    const [currentWorkout, setCurrentWorkout] = useState<SubWorkout | null>(null);
    const [workouts, setWorkouts] = useState<SubWorkout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initialize = async () => {
            console.log("Initializing Sidebar...");
            while (coachTrainingCache.isLoading()) {
                console.log("Waiting for CoachTrainingCache to load...");
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            setLoading(false);
            console.log("Sidebar initialized.");
        };
        initialize();
    }, []);

    const handleCompleteWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleSkipWorkout = () => {
        setCurrentWorkout(null);
    };

    const handleWorkoutComplete = (workout: SubWorkout) => {
        setWorkouts((prevWorkouts) => prevWorkouts.filter(w => w !== workout));
        setCurrentWorkout(workouts[0] || null);
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.sidebar}>
            <CoachDialog currentWorkout={currentWorkout} onComplete={handleCompleteWorkout} onSkip={handleSkipWorkout} />
            <SubWorkoutList onWorkoutComplete={handleWorkoutComplete} />
        </div>
    );
};

export default Sidebar;