import React, { useEffect, useRef, useState } from 'react';
import { WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import styles from './WorkoutDetails.module.css';
import WorkoutTimer from '../WorkoutTimer/WorkoutTimer';
import { playCompleteSound, playSkipSound, playTimeoutSound } from '../../utils/AudioPlayer';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

interface WorkoutDetailsProps {
    item: WorkoutSet | WorkoutBlock;
}

const WorkoutDetails: React.FC<WorkoutDetailsProps> = ({ item }) => {
    const { schedule, isLoading, loadSchedule, completeCurrentWorkout, skipCurrentWorkout, createNewSchedule, scheduleVersion } = useWorkoutSchedule();
    const timerRef = useRef<{ resetTimer: () => void }>(null);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
    const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);

    useEffect(() => {
        console.log('WorkoutDetails: Loading schedule...');
        loadSchedule().catch(error => {
            console.error('Failed to load schedule:', error);
        }); // Load the workout schedule on component mount
    }, [loadSchedule]);

    useEffect(() => {
        if (item) {
            console.log('Workout updated:', item);
            timerRef.current?.resetTimer();
        }
    }, [item]);

    useEffect(() => {
        // Log schedule changes for debugging
        console.log('Schedule updated:', schedule);
    }, [schedule, scheduleVersion]);

    if (isLoading) {
        console.log('Loading workouts...');
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!item) {
        console.warn('WorkoutDetails: No workout sets or blocks.');
        return (
            <div className={styles.noWorkout}>
                {schedule && schedule.scheduleItems.length === 0 && (
                    <button onClick={createNewSchedule} className={styles.createNewScheduleButton}>
                        Create New Workout Schedule
                    </button>
                )}
            </div>
        );
    }

    const handleCompleteWorkout = async () => {
        console.log('Workout completed:', item);
        playCompleteSound();
        completeCurrentWorkout();
        if (item instanceof WorkoutSet && currentWorkoutIndex < item.workouts.length - 1) {
            setCurrentWorkoutIndex(prevIndex => prevIndex + 1);
        } else {
            setCurrentScheduleIndex(prevIndex => prevIndex + 1);
            setCurrentWorkoutIndex(0);
        }
        timerRef.current?.resetTimer();
    };

    const handleSkipWorkout = async () => {
        console.log('Workout skipped:', item);
        playSkipSound();
        skipCurrentWorkout();
        if (item instanceof WorkoutSet && currentWorkoutIndex < item.workouts.length - 1) {
            setCurrentWorkoutIndex(prevIndex => prevIndex + 1);
        } else {
            setCurrentScheduleIndex(prevIndex => prevIndex + 1);
            setCurrentWorkoutIndex(0);
        }
        timerRef.current?.resetTimer();
    };

    const handleTimeoutWorkout = async () => {
        console.log('Workout timed out:', item);
        playTimeoutSound();
        skipCurrentWorkout();
        if (item instanceof WorkoutSet && currentWorkoutIndex < item.workouts.length - 1) {
            setCurrentWorkoutIndex(prevIndex => prevIndex + 1);
        } else {
            setCurrentScheduleIndex(prevIndex => prevIndex + 1);
            setCurrentWorkoutIndex(0);
        }
    };

    if (item instanceof WorkoutSet) {
        const currentWorkout = item.workouts[currentWorkoutIndex];
        if (!currentWorkout) {
            return <div className={styles.noWorkout}>All workouts in this set are completed.</div>;
        }
        const [workout] = currentWorkout;
        return (
            <div className={styles.workoutDetails}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <div className={styles.title}>
                            <h1>{workout.name}</h1>
                        </div>
                        <div className={styles.subDetails}>
                            <p>⏱️ {workout.duration}</p>
                            <p>🔥 {workout.intensity}</p>
                            <p>🎚️ {workout.difficulty_range[0]} - {workout.difficulty_range[1]}</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.workoutDetailsButtonGroup}>
                            <div className={styles.workoutDetailsButton}>
                                <button onClick={handleCompleteWorkout}>✅</button>
                            </div>
                            <div className={styles.workoutDetailsButton}>
                                <button onClick={handleSkipWorkout}>⏭️</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.description}>
                    <p>{workout.description}</p>
                </div>
            </div>
        );
    } else if (item instanceof WorkoutBlock) {
        return (
            <div className={styles.workoutDetails}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <div className={styles.title}>
                            <h1>{item.name}</h1>
                        </div>
                        <div className={styles.left}>
                            <div className={styles.subDetails}>
                                <p>{item.description}</p>
                                <p>Duration: {item.duration} minutes</p>
                            </div>
                            <div className={styles.timer}>
                                <WorkoutTimer ref={timerRef} duration={item.duration * 60} onComplete={handleTimeoutWorkout} />
                            </div>
                            <div className={styles.description}>
                                <p>{item.intervalDetails}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.workoutDetailsButtonGroup}>
                            <div className={styles.workoutDetailsButton}>
                                <button onClick={handleCompleteWorkout}>✅</button>
                            </div>
                            <div className={styles.workoutDetailsButton}>
                                <button onClick={handleSkipWorkout}>⏭️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        console.error(`WorkoutDetails: Unknown workout type: ${item} at index [${currentScheduleIndex}]`);
        return <div className={styles.noWorkout}>Unknown workout type</div>;
    }
};

export default WorkoutDetails;