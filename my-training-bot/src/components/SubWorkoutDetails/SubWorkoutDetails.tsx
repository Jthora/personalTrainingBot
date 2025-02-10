import React from 'react';
import { SubWorkout } from '../../types/SubWorkout';
import styles from './SubWorkoutDetails.module.css';
import SubWorkoutTimer from '../SubWorkoutTimer/SubWorkoutTimer';
import { playCompleteSound, playSkipSound } from '../../utils/AudioPlayer';

interface SubWorkoutDetailsProps {
    workout: SubWorkout | null;
    onSkipWorkout: () => void;
    onCompleteWorkout: () => void;
}

const SubWorkoutDetails: React.FC<SubWorkoutDetailsProps> = ({ workout, onSkipWorkout, onCompleteWorkout }) => {

    const handleCompleteWorkout = () => {
        playCompleteSound();
        onCompleteWorkout();
    };

    const handleSkipWorkout = () => {
        playSkipSound();
        onSkipWorkout();
    };

    if (!workout) {
        return <div className={styles.noWorkout}>No workout selected</div>;
    }

    return (
        <div className={styles.workoutDetails}>
            <div className={styles.left}>
                <h2>{workout.name}</h2>
                <p>{workout.description}</p>
                <p>Duration: {workout.duration}</p>
                <p>Intensity: {workout.intensity}</p>
            </div>
            <div className={styles.right}>
                <div className={styles.top}>
                    <button onClick={handleCompleteWorkout}>Complete Workout ✅</button>
                    <button onClick={handleSkipWorkout}>Skip Workout ⏭️</button>
                </div>
                <div className={styles.bottom}>
                    <SubWorkoutTimer onComplete={handleCompleteWorkout} />
                </div>
            </div>
        </div>
    );
};

export default SubWorkoutDetails;