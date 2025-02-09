import React, { useEffect, useState } from 'react';
import SubWorkoutCard from '../SubWorkoutCard/SubWorkoutCard';
import WorkoutScheduler from '../WorkoutScheduler/WorkoutScheduler';
import styles from './SubWorkoutList.module.css';
import { createWorkoutSchedule } from '../../utils/WorkoutScheduleCreator';
import { SubWorkout } from '../../types/SubWorkout';
import coachTrainingCache from '../../cache/CoachTrainingCache';

const SubWorkoutList: React.FC<{ onWorkoutComplete: (workout: SubWorkout) => void }> = ({ onWorkoutComplete }) => {
    const [workouts, setWorkouts] = useState<SubWorkout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchWorkoutSchedule = async () => {
        console.log("Fetching workout schedule...");
        const schedule = await createWorkoutSchedule();
        setWorkouts(schedule.workouts.slice(0, 10)); // Limit to 10 workouts
        console.log("Workout schedule fetched and set.");
    };

    useEffect(() => {
        const initialize = async () => {
            console.log("Initializing WorkoutList...");
            while (coachTrainingCache.isLoading()) {
                console.log("Waiting for CoachTrainingCache to load...");
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log("CoachTrainingCache loaded. Fetching workout schedule...");
            await fetchWorkoutSchedule();
            setLoading(false);
            console.log("WorkoutList initialized.");
        };
        initialize();
    }, []);

    const handleWorkoutComplete = (workout: SubWorkout) => {
        onWorkoutComplete(workout);
        setWorkouts((prevWorkouts) => prevWorkouts.filter(w => w !== workout));
    };

    const handleCreateRandomWorkout = async () => {
        await fetchWorkoutSchedule();
    };

    const handleShuffleCurrentWorkout = () => {
        setWorkouts((prevWorkouts) => [...prevWorkouts].sort(() => Math.random() - 0.5));
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.workoutList}>
            {workouts.map((workout, index) => (
                <SubWorkoutCard key={index} workout={workout} />
            ))}
            <WorkoutScheduler onCreateRandomWorkout={handleCreateRandomWorkout} onShuffleCurrentWorkout={handleShuffleCurrentWorkout} />
        </div>
    );
};

export default SubWorkoutList;