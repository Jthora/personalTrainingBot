import difficultyLevels from "../data/training_coach_data/difficulty_levels.json";
import ranksData from "../data/training_coach_data/ranks.json";
import tigerSpeech from "../data/training_coach_data/tiger_speech.json";
import trainingChallenges from "../data/training_coach_data/training_challenges.json";
import workouts from "../data/training_coach_data/workouts.json";
import { DifficultyLevel, Rank, Workout, WorkoutsData, SubWorkout } from "../types/CoachTypes";

// Ensure ranks data has the correct type
const ranks: Rank[] = ranksData.map(rank => ({
    name: rank.rank,
    description: rank.description,
    // ...other properties from rank
}));

// Random selection function
const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

// Fetches a random motivational speech
export const fetchSpeech = (): string => getRandomItem(tigerSpeech.motivational_quotes);

// Fetches a random workout challenge
export const fetchWorkout = (): string => getRandomItem(trainingChallenges).task;

// Fetches a random workout from a specific category and sub-category
export const fetchWorkoutByCategory = (category: string, subCategory: string): Workout | null => {
    const categoryData = (workouts as WorkoutsData)[category];
    if (!categoryData) {
        return null;
    }
    const subCategoryData = categoryData[subCategory];
    if (!subCategoryData) {
        return null;
    }
    return getRandomItem(subCategoryData);
};

// Fetches a random sub-workout from a specific workout
export const fetchSubWorkout = (category: string, subCategory: string, workoutName: string): SubWorkout | null => {
    const categoryData = (workouts as WorkoutsData)[category];
    if (!categoryData) {
        return null;
    }
    const subCategoryData = categoryData[subCategory];
    if (!subCategoryData) {
        return null;
    }
    const workout = subCategoryData.find(workout => workout.name === workoutName);
    if (!workout) {
        return null;
    }
    return getRandomItem(workout.sub_workouts);
};

// Fetches all workouts in a specific category
export const fetchAllWorkoutsInCategory = (category: string): Workout[] | null => {
    const categoryData = (workouts as WorkoutsData)[category];
    return Array.isArray(categoryData) ? categoryData : null;
};

// Fetches all sub-workouts for a specific workout
export const fetchAllSubWorkouts = (category: string, subCategory: string, workoutName: string): SubWorkout[] | null => {
    const categoryData = (workouts as WorkoutsData)[category];
    if (!categoryData) {
        return null;
    }
    const subCategoryData = categoryData[subCategory];
    if (!subCategoryData) {
        return null;
    }
    const workout = subCategoryData.find(workout => workout.name === workoutName);
    if (!workout) {
        return null;
    }
    return workout.sub_workouts || null;
};

// Fetches all ranks
export const fetchAllRanks = (): Rank[] | null => {
    return ranks || null;
};

// Fetches a specific rank by name
export const fetchRankByName = (rankName: string): Rank | null => {
    return ranks.find(rank => rank.name === rankName) || null;
};

// Fetches the next rank based on the current rank
export const fetchNextRank = (currentRankName: string): Rank | null => {
    const currentRankIndex = ranks.findIndex(rank => rank.name === currentRankName);
    if (currentRankIndex === -1 || currentRankIndex === ranks.length - 1) {
        return null;
    }
    return ranks[currentRankIndex + 1];
};

// Fetches the previous rank based on the current rank
export const fetchPreviousRank = (currentRankName: string): Rank | null => {
    const currentRankIndex = ranks.findIndex(rank => rank.name === currentRankName);
    if (currentRankIndex <= 0) {
        return null;
    }
    return ranks[currentRankIndex - 1];
};

// Fetches all difficulty levels
export const fetchAllDifficultyLevels = (): DifficultyLevel[] | null => {
    return difficultyLevels as DifficultyLevel[] || null;
};

// Fetches a specific difficulty level by name
export const fetchDifficultyLevelByName = (levelName: string): DifficultyLevel | null => {
    return (difficultyLevels as DifficultyLevel[]).find(level => level.name === levelName) || null;
};

// Fetches the next difficulty level based on the current level
export const fetchNextDifficultyLevel = (currentLevelName: string): DifficultyLevel | null => {
    const currentLevelIndex = (difficultyLevels as DifficultyLevel[]).findIndex(level => level.name === currentLevelName);
    if (currentLevelIndex === -1 || currentLevelIndex === (difficultyLevels as DifficultyLevel[]).length - 1) {
        return null;
    }
    return (difficultyLevels as DifficultyLevel[])[currentLevelIndex + 1];
};

// Fetches the previous difficulty level based on the current level
export const fetchPreviousDifficultyLevel = (currentLevelName: string): DifficultyLevel | null => {
    const currentLevelIndex = (difficultyLevels as DifficultyLevel[]).findIndex(level => level.name === currentLevelName);
    if (currentLevelIndex <= 0) {
        return null;
    }
    return (difficultyLevels as DifficultyLevel[])[currentLevelIndex - 1];
};