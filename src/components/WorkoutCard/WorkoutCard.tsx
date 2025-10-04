import React from 'react';
import styles from './WorkoutCard.module.css';
import { Workout } from '../../types/WorkoutCategory';
import { WorkoutBlock } from '../../types/WorkoutSchedule';

interface WorkoutCardProps {
    item: Workout | WorkoutBlock;
    onClick: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ item, onClick }) => {
    if (item instanceof WorkoutBlock) {
        return (
            <div className={styles.workoutCard} onClick={onClick}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Duration: {item.duration} minutes</p>
                <p>{item.intervalDetails}</p>
            </div>
        );
    } else if (item instanceof Workout) {
        return (
            <div className={styles.workoutCard} onClick={onClick}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Duration: {item.duration}</p>
                <p>Intensity: {item.intensity}</p>
                <p>Difficulty Range: {item.difficulty_range[0]} - {item.difficulty_range[1]}</p>
            </div>
        );
    } else {
        console.error('Unknown item type:', item);
        return <div className={styles.workoutCard}>Unknown Workout Type</div>;
    }
};

export default WorkoutCard;