import React, { useState, useEffect } from 'react';

const SubWorkoutTimer: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return 45 * 60; // Reset to 45 minutes
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete]);

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
        <div>
            <div>{`Time Left: ${minutes}:${seconds}`}</div>
        </div>
    );
};

export default SubWorkoutTimer;