import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const getRandomTime = () => {
    const min = 45 * 60; // 45 minutes in seconds
    const max = 75 * 60; // 75 minutes in seconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const SubWorkoutTimer: React.FC<{ onComplete: () => void }> = forwardRef(({ onComplete }, ref) => {
    const [timeLeft, setTimeLeft] = useState(getRandomTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return getRandomTime(); // Reset to a random time between 15 and 75 minutes
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete]);

    useImperativeHandle(ref, () => ({
        resetTimer: () => setTimeLeft(getRandomTime())
    }));

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
        <div>
            <div>{`Time Left: ${minutes}:${seconds}`}</div>
        </div>
    );
});

export default SubWorkoutTimer;