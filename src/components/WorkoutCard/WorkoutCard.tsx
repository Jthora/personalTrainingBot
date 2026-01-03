import React from 'react';
import styles from './WorkoutCard.module.css';
import { Workout } from '../../types/WorkoutCategory';
import { WorkoutBlock } from '../../types/WorkoutSchedule';

interface WorkoutCardProps {
    item: Workout | WorkoutBlock;
    onClick: () => void;
    highlight?: string;
}

const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.split(regex).map((part, index) =>
        regex.test(part) ? <mark key={index}>{part}</mark> : <React.Fragment key={index}>{part}</React.Fragment>
    );
};

const WorkoutCard: React.FC<WorkoutCardProps> = ({ item, onClick, highlight }) => {
    if (item instanceof WorkoutBlock) {
        return (
            <div className={styles.workoutCard} onClick={onClick}>
                <h3>{highlightText(item.name, highlight)}</h3>
                <p>{highlightText(item.description, highlight)}</p>
                <p>Duration: {item.duration} minutes</p>
                <p>{item.intervalDetails}</p>
            </div>
        );
    } else if (item instanceof Workout) {
        return (
            <div className={styles.workoutCard} onClick={onClick}>
                <h3>{highlightText(item.name, highlight)}</h3>
                <p>{highlightText(item.description, highlight)}</p>
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