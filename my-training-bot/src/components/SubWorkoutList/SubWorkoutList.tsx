import React from 'react';
import SubWorkoutCard from '../SubWorkoutCard/SubWorkoutCard';
import styles from './SubWorkoutList.module.css';
import { useWorkoutSchedule } from '../../context/WorkoutScheduleContext';
import { SubWorkout } from '../../types/SubWorkout';

const SubWorkoutList: React.FC<{ onWorkoutComplete: (workout: SubWorkout) => void }> = ({ onWorkoutComplete }) => {
    const { schedule } = useWorkoutSchedule();

    return (
        <div className={styles.workoutList}>
            {schedule.map((workout, index) => (
                <SubWorkoutCard key={index} workout={workout} />
            ))}
        </div>
    );
};

export default SubWorkoutList;