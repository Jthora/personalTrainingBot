import React, { useState, useEffect, useMemo } from 'react';
import styles from './CoachDialog.module.css';
import TrainingCoachCache from '../../cache/TrainingCoachCache';
import WorkoutDetails from '../WorkoutDetails/WorkoutDetails';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { useCoachSelection } from '../../hooks/useCoachSelection';
import { coaches, defaultCoachId } from '../../data/coaches';
import { WorkoutBlock, WorkoutSet } from '../../types/WorkoutSchedule';

const CoachDialog: React.FC = () => {
    const [quote, setQuote] = useState('');
    const { coachId: selectedCoach } = useCoachSelection();
    const { schedule, isLoading, createNewSchedule } = useWorkoutSchedule();

    const currentItem = useMemo(() => {
        if (!schedule) return null;
        return schedule.scheduleItems.find(item => {
            if (item instanceof WorkoutBlock) return true;
            if (item instanceof WorkoutSet) {
                return item.workouts.some(([, completed]) => !completed);
            }
            return false;
        }) ?? null;
    }, [schedule]);

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

    const coachData = coaches.find(coach => coach.id === selectedCoach) ?? coaches.find(coach => coach.id === defaultCoachId);
    const coachIcon = coachData?.icon;
    const coachName = coachData?.name ?? 'Coach';

    const getCoachColor = () => {
        const coachData = TrainingCoachCache.getInstance().getCoachData(selectedCoach);
        return coachData.color || '#000000';
    };

    return (
        <div className={styles.coachDialog}>
            <div className={styles.header}>
                {coachIcon && (
                    <div className={styles.iconFrame}>
                        <img src={coachIcon} alt="Coach Icon" className={styles.icon} />
                    </div>
                )}
                <div className={styles.textContainer}>
                    <div className={styles.titleContainer}>
                        <h3 className={styles.coach}>Coach:</h3>
                        <h2 className={styles.title}>{coachName}</h2>
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