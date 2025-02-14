import React, { useState, useEffect } from 'react';
import styles from './CoachDialog.module.css';
import tigerIcon from '../../assets/images/icons/tiger_fitness_god-icon-512x.png';
import TrainingCoachCache from '../../cache/TrainingCoachCache';
import WorkoutDetails from '../WorkoutDetails/WorkoutDetails';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

const CoachDialog: React.FC = () => {
    const [quote, setQuote] = useState('');
    const { isLoading } = useWorkoutSchedule(); // TODO: a hook for TrainingCoachCache is what should used for this loading

    useEffect(() => {
        const loadMotivationalQuote = async () => {
            setQuote(TrainingCoachCache.getInstance().getRandomMotivationalQuote());
        };

        loadMotivationalQuote(); // Initial fetch

        const getRandomInterval = () => Math.floor((Math.random() * 10) + 1) * 60000; // Random interval between 10 and 30 minutes

        const intervalId = setInterval(() => {
            setQuote(TrainingCoachCache.getInstance().getRandomMotivationalQuote());
        }, getRandomInterval());

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                <img src={tigerIcon} alt="Coach Icon" className={styles.icon} width="128" height="128" />
                <div className={styles.textContainer}>
                    <div className={styles.titleContainer}>
                        <h3 className={styles.coach}>Coach:</h3>
                        <h2 className={styles.title}>Tiger Fitness God</h2>
                    </div>
                    <div className={styles.quote}>"{quote}"</div>
                </div>
            </div>
            <div className={styles.workoutDetails}>
                <WorkoutDetails />
            </div>
        </div>
    );
};

export default CoachDialog;