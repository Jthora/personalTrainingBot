import React, { useRef } from 'react';
import { SubWorkout } from '../../types/SubWorkout';
import styles from './SubWorkoutDetails.module.css';
import SubWorkoutTimer from '../SubWorkoutTimer/SubWorkoutTimer';
import { playCompleteSound, playSkipSound, playTimeoutSound } from '../../utils/AudioPlayer';

interface SubWorkoutDetailsProps {
    workout: SubWorkout | null;
    onSkipWorkout: () => void;
    onCompleteWorkout: () => void;
}

const SubWorkoutDetails: React.FC<SubWorkoutDetailsProps> = ({ workout, onSkipWorkout, onCompleteWorkout }) => {
    const timerRef = useRef<{ resetTimer: () => void }>(null);

    const handleCompleteWorkout = () => {
        playCompleteSound();
        onCompleteWorkout();
        timerRef.current?.resetTimer();
    };

    const handleSkipWorkout = () => {
        playSkipSound();
        onSkipWorkout();
        timerRef.current?.resetTimer();
    };

    const handleTimeoutWorkout = () => {
        playTimeoutSound();
        onCompleteWorkout();
    };

    if (!workout) {
        return <div className={styles.noWorkout}>No workout selected</div>;
    }

    return (
        <div>
            <div className={styles.workoutDetails}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <h1>{workout.name}</h1>
                        <div className={styles.subDetails}>
                            <p>⏱️ {workout.duration}</p>
                            <p>🔥 {workout.intensity} Intensity</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <SubWorkoutTimer
                            ref={timerRef}
                            onComplete={handleTimeoutWorkout}
                        />
                        <button onClick={handleCompleteWorkout}>Complete ✅</button>
                        <button onClick={handleSkipWorkout}>Skip ⏭️</button>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>{workout.description}</p>
                </div>
            </div>
        </div>
        
    );
};

export default SubWorkoutDetails;