import React, { useState, useEffect } from 'react';
import styles from './CoachDialog.module.css';
import tigerIcon from '../../assets/images/icons/tiger_fitness_god-icon-512x.png';
import { fetchSpeech } from '../../utils/CoachDataLoader';
import SubWorkoutDetails from '../SubWorkoutDetails/SubWorkoutDetails';
import { useWorkoutSchedule } from '../../context/WorkoutScheduleContext';
import { SubWorkout } from '../../types/SubWorkout';

const CoachDialog: React.FC = () => {
    const [quote, setQuote] = useState('');
    const { schedule, addWorkoutToEnd } = useWorkoutSchedule();
    const [currentWorkout, setCurrentWorkout] = useState<SubWorkout | null>(schedule[0] || null);

    useEffect(() => {
        const updateQuote = () => {
            setQuote(fetchSpeech());
        };

        updateQuote(); // Initial fetch

        const getRandomInterval = () => Math.floor((Math.random() * 10) + 1) * 60000; // Random interval between 10 and 30 minutes

        const intervalId = setInterval(updateQuote, getRandomInterval());

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    useEffect(() => {
        setCurrentWorkout(schedule[0] || null); // Update current workout whenever the schedule changes
    }, [schedule]);

    const handleCompleteWorkout = () => {
        if (currentWorkout) {
            addWorkoutToEnd(currentWorkout);
            setCurrentWorkout(schedule[1] || null); // Move to the next workout
        }
    };

    const handleSkipWorkout = () => {
        if (currentWorkout) {
            addWorkoutToEnd(currentWorkout);
            setCurrentWorkout(schedule[1] || null); // Move to the next workout
        }
    };

    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                <img src={tigerIcon} alt="Coach Icon" className={styles.icon} width="128" height="128" />
                <div className={styles.textContainer}>
                    <h3 className={styles.title}>Coach: Tiger Fitness God</h3>
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