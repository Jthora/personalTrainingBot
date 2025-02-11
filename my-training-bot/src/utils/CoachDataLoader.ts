import difficultyLevels from "../data/training_coach_data/difficulty_levels.json";
import ranksData from "../data/training_coach_data/ranks.json";
import tigerSpeech from "../data/training_coach_data/tiger_speech.json";
import trainingChallenges from "../data/training_coach_data/training_challenges.json";
import workouts from "../data/training_coach_data/workouts.json";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { WorkoutRank } from "../types/WorkoutRank";
import { Workout } from "../types/Workout";
import { WorkoutsData } from "../types/WorkoutsData";
import { SubWorkout } from "../types/SubWorkout";

// Ensure ranks data has the correct type
const ranks: WorkoutRank[] = ranksData.map(rank => ({
    name: rank.rank,
    description: rank.description,
    // ...other properties from rank
}));

// Random selection function
const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

// Fetches a random motivational speech
export const fetchSpeech = (): string => {
    try {
        return getRandomItem(tigerSpeech.motivational_quotes);
    } catch (error) {
        console.error("Failed to fetch speech:", error);
        return "";
    }
};

// Fetches a random boast
export const fetchBoast = (): string => {
    try {
        return getRandomItem(tigerSpeech.boasts);
    } catch (error) {
        console.error("Failed to fetch boast:", error);
        return "";
    }
};

// Fetches a random growl
export const fetchGrowl = (): string => {
    try {
        return getRandomItem(tigerSpeech.growls);
    } catch (error) {
        console.error("Failed to fetch growl:", error);
        return "";
    }
};

// Fetches a random workout challenge
export const fetchWorkout = (): string => {
    try {
        return getRandomItem(trainingChallenges).task;
    } catch (error) {
        console.error("Failed to fetch workout challenge:", error);
        return "";
    }
};

// Fetches a random workout from a specific category and sub-category
export const fetchWorkoutByCategory = (category: string, subCategory: string): Workout | null => {
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = categoryData[subCategory];
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        return getRandomItem(subCategoryData);
    } catch (error) {
        console.error(`Failed to fetch workout by category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches a random sub-workout from a specific workout
export const fetchSubWorkout = (category: string, subCategory: string, workoutName: string): SubWorkout | null => {
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = categoryData[subCategory];
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        const workout = subCategoryData.find(workout => workout.name === workoutName);
        if (!workout) {
            console.warn(`Workout ${workoutName} not found in sub-category ${subCategory} of category ${category}.`);
            return null;
        }
        return getRandomItem(workout.sub_workouts);
    } catch (error) {
        console.error(`Failed to fetch sub-workout for workout ${workoutName} in category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches all workouts in a specific category
export const fetchAllWorkoutsInCategory = (category: string): Workout[] | null => {
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        return Array.isArray(categoryData) ? categoryData : null;
    } catch (error) {
        console.error(`Failed to fetch all workouts in category ${category}:`, error);
        return null;
    }
};

// Fetches all sub-workouts for a specific workout
export const fetchAllSubWorkouts = (category: string, subCategory: string, workoutName: string): SubWorkout[] | null => {
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = categoryData[subCategory];
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        const workout = subCategoryData.find(workout => workout.name === workoutName);
        if (!workout) {
            console.warn(`Workout ${workoutName} not found in sub-category ${subCategory} of category ${category}.`);
            return null;
        }
        return workout.sub_workouts || null;
    } catch (error) {
        console.error(`Failed to fetch all sub-workouts for workout ${workoutName} in category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches all sub-workouts in a specific category
export const fetchAllSubWorkoutsInCategory = (category: string): SubWorkout[] | null => {
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subWorkouts: SubWorkout[] = [];
        for (const subCategory in categoryData) {
            const workoutsInSubCategory = categoryData[subCategory];
            workoutsInSubCategory.forEach(workout => {
                subWorkouts.push(...workout.sub_workouts);
            });
        }
        return subWorkouts;
    } catch (error) {
        console.error(`Failed to fetch all sub-workouts in category ${category}:`, error);
        return null;
    }
};

// Fetches all ranks
export const fetchAllRanks = (): WorkoutRank[] | null => {
    try {
        return ranks || null;
    } catch (error) {
        console.error("Failed to fetch all ranks:", error);
        return null;
    }
};

// Fetches a specific rank by name
export const fetchRankByName = (rankName: string): WorkoutRank | null => {
    try {
        return ranks.find(rank => rank.name === rankName) || null;
    } catch (error) {
        console.error(`Failed to fetch rank by name ${rankName}:`, error);
        return null;
    }
};

// Fetches the next rank based on the current rank
export const fetchNextRank = (currentRankName: string): WorkoutRank | null => {
    try {
        const currentRankIndex = ranks.findIndex(rank => rank.name === currentRankName);
        if (currentRankIndex === -1 || currentRankIndex === ranks.length - 1) {
            return null;
        }
        return ranks[currentRankIndex + 1];
    } catch (error) {
        console.error(`Failed to fetch next rank for current rank ${currentRankName}:`, error);
        return null;
    }
};

// Fetches the previous rank based on the current rank
export const fetchPreviousRank = (currentRankName: string): WorkoutRank | null => {
    try {
        const currentRankIndex = ranks.findIndex(rank => rank.name === currentRankName);
        if (currentRankIndex <= 0) {
            return null;
        }
        return ranks[currentRankIndex - 1];
    } catch (error) {
        console.error(`Failed to fetch previous rank for current rank ${currentRankName}:`, error);
        return null;
    }
};

// Fetches all difficulty levels
export const fetchAllDifficultyLevels = async (): Promise<WorkoutDifficultyLevel[]> => {
    try {
        return difficultyLevels.map(level => ({
            name: level.name,
            description: level.description,
            military_soldier: level.military_soldier,
            athlete_archetype: level.athlete_archetype,
            level: level.level,
            pft: level.pft,
            requirements: level.requirements
        })) as WorkoutDifficultyLevel[];
    } catch (error) {
        console.error("Failed to fetch difficulty levels:", error);
        return [];
    }
};

// Fetches a specific difficulty level by name
export const fetchDifficultyLevelByName = (levelName: string): WorkoutDifficultyLevel | null => {
    try {
        return (difficultyLevels as WorkoutDifficultyLevel[]).find(level => level.name === levelName) || null;
    } catch (error) {
        console.error(`Failed to fetch difficulty level by name ${levelName}:`, error);
        return null;
    }
};

// Fetches the next difficulty level based on the current level
export const fetchNextDifficultyLevel = (currentLevelName: string): WorkoutDifficultyLevel | null => {
    try {
        const currentLevelIndex = (difficultyLevels as WorkoutDifficultyLevel[]).findIndex(level => level.name === currentLevelName);
        if (currentLevelIndex === -1 || currentLevelIndex === (difficultyLevels as WorkoutDifficultyLevel[]).length - 1) {
            return null;
        }
        return (difficultyLevels as WorkoutDifficultyLevel[])[currentLevelIndex + 1];
    } catch (error) {
        console.error(`Failed to fetch next difficulty level for current level ${currentLevelName}:`, error);
        return null;
    }
};

// Fetches the previous difficulty level based on the current level
export const fetchPreviousDifficultyLevel = (currentLevelName: string): WorkoutDifficultyLevel | null => {
    try {
        const currentLevelIndex = (difficultyLevels as WorkoutDifficultyLevel[]).findIndex(level => level.name === currentLevelName);
        if (currentLevelIndex <= 0) {
            return null;
        }
        return (difficultyLevels as WorkoutDifficultyLevel[])[currentLevelIndex - 1];
    } catch (error) {
        console.error(`Failed to fetch previous difficulty level for current level ${currentLevelName}:`, error);
        return null;
    }
};