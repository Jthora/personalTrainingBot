import React, { useState, useEffect } from 'react';
import styles from './CoachDialog.module.css';
import tigerIcon from '../../assets/images/icons/coaches/tiger_fitness_god-icon.png';
import jonoIcon from '../../assets/images/icons/coaches/jono_thora-icon.png';
import taraIcon from '../../assets/images/icons/coaches/tara_van_dekar-icon.png';
import simonIcon from '../../assets/images/icons/coaches/agent_simon-icon.png';
import TrainingCoachCache from '../../cache/TrainingCoachCache';
import WorkoutDetails from '../WorkoutDetails/WorkoutDetails';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

const CoachDialog: React.FC = () => {
    const [quote, setQuote] = useState('');
    const [selectedCoach, setSelectedCoach] = useState<string>('tiger_fitness_god');
    const { schedule, isLoading, createNewSchedule } = useWorkoutSchedule();
    const currentItem = schedule?.scheduleItems[0];

    useEffect(() => {
        const storedCoach = localStorage.getItem('selectedCoach');
        if (storedCoach) {
            setSelectedCoach(storedCoach);
        }
    }, []);

    useEffect(() => {
        const loadMotivationalQuote = async () => {
            setQuote(TrainingCoachCache.getInstance().getRandomMotivationalQuote(selectedCoach));
        };

        loadMotivationalQuote(); // Initial fetch

        const getRandomInterval = () => Math.floor((Math.random() * 10) + 1) * 60000; // Random interval between 10 and 30 minutes

        const intervalId = setInterval(() => {
            setQuote(TrainingCoachCache.getInstance().getRandomMotivationalQuote(selectedCoach));
        }, getRandomInterval());

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [selectedCoach]);

    const getCoachIcon = () => {
        switch (selectedCoach) {
            case 'jono_thora':
                return jonoIcon;
            case 'tara_van_dekar':
                return taraIcon;
            case 'agent_simon':
                return simonIcon;
            default:
                return tigerIcon;
        }
    };

    const getCoachName = () => {
        switch (selectedCoach) {
            case 'jono_thora':
                return 'Jono Tho\'ra';
            case 'tara_van_dekar':
                return 'Tara Van Dekar';
            case 'agent_simon':
                return 'Agent Simon';
            default:
                return 'Tiger Fitness God';
        }
    };

    const getCoachColor = () => {
        const coachData = TrainingCoachCache.getInstance().getCoachData(selectedCoach);
        return coachData.color || '#000000';
    };

    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                <img src={getCoachIcon()} alt="Coach Icon" className={styles.icon} width="128" height="128" />
                <div className={styles.textContainer}>
                    <div className={styles.titleContainer}>
                        <h3 className={styles.coach}>Coach:</h3>
                        <h2 className={styles.title}>{getCoachName()}</h2>
                    </div>
                    <div className={styles.quote} style={{ color: `${getCoachColor()}` }}>"{quote}"</div>
                </div>
            </div>
            <div className={styles.workoutDetails}>
                {!isLoading && currentItem ? (
                    <WorkoutDetails item={currentItem} />
                ) : (
                    <div className={styles.noWorkout}>
                        <p>All workouts are completed or skipped.</p>
                        <button onClick={createNewSchedule} className={styles.createNewScheduleButton}>
                            Create New Workout Schedule
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachDialog;