import React from 'react';
import SubWorkoutCard from '../SubWorkoutCard/SubWorkoutCard';
import styles from './SubWorkoutList.module.css';
import { useWorkoutSchedule } from '../../hooks/useWorkoutSchedule';
import { Workout } from '../../types/WorkoutCategory';

const SubWorkoutList: React.FC<{ onWorkoutComplete: (workout: Workout) => void }> = ({ onWorkoutComplete }) => {
    const { schedule } = useWorkoutSchedule();

    return (
        <div className={styles.workoutList}>
            Up Next:
            {schedule.map((workout, index) => {
                if (index === 0) {
                    return null;
                }
                return <SubWorkoutCard key={index} workout={workout} onClick={() => onWorkoutComplete(workout)} />;
            })}
        </div>
    );
};

export default SubWorkoutList;