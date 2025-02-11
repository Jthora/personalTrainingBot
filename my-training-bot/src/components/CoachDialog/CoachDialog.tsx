import React, { useState, useEffect } from 'react';
import styles from './CoachDialog.module.css';
import tigerIcon from '../../assets/images/icons/tiger_fitness_god-icon-512x.png';
import { fetchSpeech, fetchBoast, fetchGrowl } from '../../utils/CoachDataLoader';
import SubWorkoutDetails from '../SubWorkoutDetails/SubWorkoutDetails';
import { useWorkoutSchedule } from '../../hooks/useWorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';

interface CoachDialogProps {
    currentWorkout: Workout | null;
    onComplete: () => void;
    onSkip: () => void;
}

const CoachDialog: React.FC<CoachDialogProps> = ({ currentWorkout, onComplete, onSkip }) => {
    const [quote, setQuote] = useState('');
    const { completeCurrentWorkout, skipCurrentWorkout } = useWorkoutSchedule();

    useEffect(() => {
        const updateQuote = () => {
            setQuote(fetchSpeech());
        };

        updateQuote(); // Initial fetch

        const getRandomInterval = () => Math.floor((Math.random() * 10) + 1) * 60000; // Random interval between 10 and 30 minutes

        const intervalId = setInterval(updateQuote, getRandomInterval());

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    const handleCompleteWorkout = () => {
        completeCurrentWorkout();
        setQuote(fetchBoast());
        onComplete();
    };

    const handleSkipWorkout = () => {
        skipCurrentWorkout();
        setQuote(fetchGrowl());
        onSkip();
    };

    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                <img src={tigerIcon} alt="Coach Icon" className={styles.icon} width="128" height="128" />
                <div className={styles.textContainer}>
                    <div className={styles.titleContainer}>
                        <h3 className={styles.title}>Coach:</h3>
                        <h2 className={styles.title}>Tiger Fitness God</h2>
                    </div>
                    <div className={styles.quote}>"{quote}"</div>
                </div>
            </div>
            <div className={styles.workoutDetails}>
                <SubWorkoutDetails workout={currentWorkout} onSkipWorkout={handleSkipWorkout} onCompleteWorkout={handleCompleteWorkout} />
            </div>
        </div>
    );
};

export default CoachDialog;