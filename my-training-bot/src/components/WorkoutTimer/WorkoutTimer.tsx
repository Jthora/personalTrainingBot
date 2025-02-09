import React, { useState, useEffect } from 'react';

const WorkoutTimer: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
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

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div>
            <div>{`${minutes} minutes ${seconds} seconds left`}</div>
        </div>
    );
};

export default WorkoutTimer;