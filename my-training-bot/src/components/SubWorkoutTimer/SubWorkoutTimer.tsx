import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import styles from './SubWorkoutTimer.module.css';

const getRandomTime = () => {
    const min = 45 * 60; // 45 minutes in seconds
    const max = 75 * 60; // 75 minutes in seconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const SubWorkoutTimer: React.FC<{ onComplete: () => void }> = forwardRef(({ onComplete }, ref) => {
    const [timeLeft, setTimeLeft] = useState(getRandomTime());
    const [isPaused, setIsPaused] = useState(false);

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
        <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>{`Time Left: ${minutes}:${seconds}`}</div>
                <button onClick={togglePause} className={styles.button}>
                    {isPaused ? '⏸️' : '▶️'}
                </button>
            </div>
        </div>
    );
});

export default SubWorkoutTimer;