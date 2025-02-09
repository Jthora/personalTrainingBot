import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import coachTrainingCache from '../cache/CoachTrainingCache';
import { Workout } from '../types/Workout';
import { WorkoutDifficultyLevel } from '../types/WorkoutDifficultyLevel';
import { WorkoutRank } from '../types/WorkoutRank';
import { SubWorkout } from '../types/SubWorkout';

interface WorkoutContextProps {
    workouts: Workout[];
    difficultyLevels: WorkoutDifficultyLevel[];
    ranks: WorkoutRank[];
    tigerSpeech: string[];
    trainingChallenges: { task: string }[];
    refreshData: () => void;
    getWorkoutByCategory: (category: string, subCategory: string) => Workout[] | null;
    getSubWorkout: (category: string, subCategory: string, workoutName: string) => SubWorkout | null;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

interface WorkoutProviderProps {
    children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [difficultyLevels, setDifficultyLevels] = useState<WorkoutDifficultyLevel[]>([]);
    const [ranks, setRanks] = useState<WorkoutRank[]>([]);
    const [tigerSpeech, setTigerSpeech] = useState<string[]>([]);
    const [trainingChallenges, setTrainingChallenges] = useState<{ task: string }[]>([]);

    const refreshData = async () => {
        await coachTrainingCache.refreshCache();
        setWorkouts(Object.values(coachTrainingCache.getWorkouts()).flatMap(category => Object.values(category).flat()));
        setDifficultyLevels(coachTrainingCache.getDifficultyLevels());
        setRanks(coachTrainingCache.getRanks());
        setTigerSpeech(coachTrainingCache.getTigerSpeech());
        setTrainingChallenges(coachTrainingCache.getTrainingChallenges());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const getWorkoutByCategory = (category: string, subCategory: string): Workout[] | null => {
        return coachTrainingCache.getWorkoutByCategory(category, subCategory);
    };

    const getSubWorkout = (category: string, subCategory: string, workoutName: string): SubWorkout | null => {
        return coachTrainingCache.getSubWorkout(category, subCategory, workoutName);
    };

    return (
        <WorkoutContext.Provider value={{ workouts, difficultyLevels, ranks, tigerSpeech, trainingChallenges, refreshData, getWorkoutByCategory, getSubWorkout }}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkoutContext = (): WorkoutContextProps => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkoutContext must be used within a WorkoutProvider');
    }
    return context;
};
