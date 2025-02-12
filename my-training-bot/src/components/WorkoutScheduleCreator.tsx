import React, { useState, useEffect } from 'react';
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import DifficultySettingsStore from '../store/DifficultySettingsStore';
import TrainingCoachCache from '../cache/TrainingCoachCache';
import { Workout } from '../types/WorkoutCategory';
import DifficultyLevel from '../types/DifficultyLevel';
import DifficultyRange from '../types/DifficultyRange';

const WorkoutScheduleCreator: React.FC = () => {
    const [workoutSchedule, setWorkoutSchedule] = useState<Workout[]>([]);
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);

    useEffect(() => {
        const loadDifficultyLevels = async () => {
            const cache = TrainingCoachCache.getInstance();
            await cache.loadData();
            const levels = cache.getDifficultyLevels();
            setDifficultyLevels(levels);
        };
        loadDifficultyLevels();
    }, []);

    const createWorkoutSchedule = (count: number) => {
        const settings = DifficultySettingsStore.getSettings();
        const weightedDifficulty = DifficultySettingsStore.getWeightedRandomDifficulty(difficultyLevels, settings.selectedDifficulty, settings.range);
        const workouts = WorkoutCategoryCache.getInstance().getWorkoutsBySingleDifficultyLevel(weightedDifficulty, count);
        setWorkoutSchedule(workouts);
    };

    return (
        <div>
            <button onClick={() => createWorkoutSchedule(5)}>Create Workout Schedule</button>
            <ul>
                {workoutSchedule.map((workout, index) => (
                    <li key={index}>{workout.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default WorkoutScheduleCreator;
