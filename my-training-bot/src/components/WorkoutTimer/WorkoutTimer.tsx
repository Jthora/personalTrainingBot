import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import styles from './WorkoutTimer.module.css';

const getRandomTime = () => {
    const min = 45 * 60; // 45 minutes in seconds
    const max = 75 * 60; // 75 minutes in seconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface WorkoutTimerProps {
    onComplete: () => void;
}

const WorkoutTimer = forwardRef<{ resetTimer: () => void }, WorkoutTimerProps>(({ onComplete }, ref) => {
    const [timeLeft, setTimeLeft] = useState(getRandomTime());
    const [isPaused, setIsPaused] = useState(false);
    const internalRef = useRef(null);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return getRandomTime(); // Reset to a random time between 45 and 75 minutes
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete, isPaused]);

    useImperativeHandle(ref, () => ({
        resetTimer: () => setTimeLeft(getRandomTime())
    }));

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    const togglePause = () => setIsPaused(!isPaused);

    return (
        <div ref={internalRef}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={styles.timeLeft}>{`Time Left: ${minutes}:${seconds}`}</div>
                <button onClick={togglePause} className={styles.button}>
                    {isPaused ? '⏸️' : '▶️'}
                </button>
            </div>
        </div>
    );
});

export default WorkoutTimer;