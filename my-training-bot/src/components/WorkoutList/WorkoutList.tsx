import React, { useEffect, useState } from 'react';
import WorkoutCard from '../WorkoutCard/WorkoutCard';
import styles from './WorkoutList.module.css';
import { createWorkoutSchedule } from '../../utils/WorkoutScheduleCreator';
import { Workout } from '../../types/Workout';

const WorkoutList: React.FC = () => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    useEffect(() => {
        const fetchWorkoutSchedule = async () => {
            const schedule = await createWorkoutSchedule();
            setWorkouts(schedule.workouts);
        };

        fetchWorkoutSchedule();
    }, []);

    const handleManualPopulate = async () => {
        const schedule = await createWorkoutSchedule();
        setWorkouts(schedule.workouts);
    };

    return (
        <div className={styles.workoutList}>
            <button onClick={handleManualPopulate}>Populate Today's Workout</button>
            {workouts.map((workout, index) => (
                <WorkoutCard key={index} workout={workout} />
            ))}
        </div>
    );
};

export default WorkoutList;