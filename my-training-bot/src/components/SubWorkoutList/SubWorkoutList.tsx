import React from 'react';
import SubWorkoutCard from '../SubWorkoutCard/SubWorkoutCard';
import styles from './SubWorkoutList.module.css';
import { useWorkoutSchedule } from '../../context/WorkoutScheduleContext';
import { SubWorkout } from '../../types/SubWorkout';

const SubWorkoutList: React.FC<{ onWorkoutComplete: (workout: SubWorkout) => void }> = ({ onWorkoutComplete }) => {
    const { schedule } = useWorkoutSchedule();

    return (
        <div className={styles.workoutList}>
            Up Next:
            {schedule.slice(1).map((workout, index) => (
                <SubWorkoutCard key={index} workout={workout} onClick={() => onWorkoutComplete(workout)} />
            ))}
        </div>
    );
};

export default SubWorkoutList;