import React, { useState, useEffect } from 'react';

const WorkoutTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(30); // Example: 30 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const handleCompletion = () => {
        // Handle workout completion logic
    };

    return (
        <div>
            <div>{timeLeft} minutes left</div>
            <button onClick={handleCompletion}>Complete Workout</button>
        </div>
    );
};

export default WorkoutTimer;