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
    console.log("Fetching a random motivational speech...");
    try {
        const speech = getRandomItem(tigerSpeech.motivational_quotes);
        console.log(`Fetched speech: ${speech}`);
        return speech;
    } catch (error) {
        console.error("Failed to fetch speech:", error);
        return "";
    }
};

// Fetches a random workout challenge
export const fetchWorkout = (): string => {
    console.log("Fetching a random workout challenge...");
    try {
        const workout = getRandomItem(trainingChallenges).task;
        console.log(`Fetched workout challenge: ${workout}`);
        return workout;
    } catch (error) {
        console.error("Failed to fetch workout challenge:", error);
        return "";
    }
};

// Fetches a random workout from a specific category and sub-category
export const fetchWorkoutByCategory = (category: string, subCategory: string): Workout | null => {
    console.log(`Fetching workout for category: ${category}, sub-category: ${subCategory}`);
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
        const workout = getRandomItem(subCategoryData);
        console.log(`Fetched workout: ${workout.name}`);
        return workout;
    } catch (error) {
        console.error(`Failed to fetch workout by category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches a random sub-workout from a specific workout
export const fetchSubWorkout = (category: string, subCategory: string, workoutName: string): SubWorkout | null => {
    console.log(`Fetching sub-workout for category: ${category}, sub-category: ${subCategory}, workout name: ${workoutName}`);
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
        const subWorkout = getRandomItem(workout.sub_workouts);
        console.log(`Fetched sub-workout: ${subWorkout.name}`);
        return subWorkout;
    } catch (error) {
        console.error(`Failed to fetch sub-workout for workout ${workoutName} in category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches all workouts in a specific category
export const fetchAllWorkoutsInCategory = (category: string): Workout[] | null => {
    console.log(`Fetching all workouts in category: ${category}`);
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const allWorkouts: Workout[] = [];
        for (const subCategory in categoryData) {
            allWorkouts.push(...categoryData[subCategory]);
        }
        console.log(`Fetched ${allWorkouts.length} workouts in category: ${category}`);
        return allWorkouts;
    } catch (error) {
        console.error(`Failed to fetch all workouts in category ${category}:`, error);
        return null;
    }
};

// Fetches all sub-workouts for a specific category
export const fetchAllSubWorkoutsInCategory = (category: string): SubWorkout[] | null => {
    console.log(`Fetching all sub-workouts in category: ${category}`);
    try {
        const categoryData = (workouts as WorkoutsData)[category];
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const allSubWorkouts: SubWorkout[] = [];
        for (const subCategory in categoryData) {
            categoryData[subCategory].forEach(workout => {
                allSubWorkouts.push(...workout.sub_workouts);
            });
        }
        console.log(`Fetched ${allSubWorkouts.length} sub-workouts in category: ${category}`);
        return allSubWorkouts;
    } catch (error) {
        console.error(`Failed to fetch all sub-workouts in category ${category}:`, error);
        return null;
    }
};

// Fetches all sub-workouts for a specific workout
export const fetchAllSubWorkouts = (category: string, subCategory: string, workoutName: string): SubWorkout[] | null => {
    console.log(`Fetching all sub-workouts for category: ${category}, sub-category: ${subCategory}, workout name: ${workoutName}`);
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
        console.log(`Fetched ${workout.sub_workouts.length} sub-workouts for workout: ${workoutName}`);
        return workout.sub_workouts || null;
    } catch (error) {
        console.error(`Failed to fetch all sub-workouts for workout ${workoutName} in category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches all ranks
export const fetchAllRanks = (): WorkoutRank[] | null => {
    console.log("Fetching all ranks...");
    try {
        console.log(`Fetched ${ranks.length} ranks.`);
        return ranks || null;
    } catch (error) {
        console.error("Failed to fetch all ranks:", error);
        return null;
    }
};

// Fetches a specific rank by name
export const fetchRankByName = (rankName: string): WorkoutRank | null => {
    console.log(`Fetching rank by name: ${rankName}`);
    try {
        const rank = ranks.find(rank => rank.name === rankName) || null;
        if (rank) {
            console.log(`Fetched rank: ${rank.name}`);
        } else {
            console.warn(`Rank ${rankName} not found.`);
        }
        return rank;
    } catch (error) {
        console.error(`Failed to fetch rank by name ${rankName}:`, error);
        return null;
    }
};

// Fetches the next rank based on the current rank
export const fetchNextRank = (currentRankName: string): WorkoutRank | null => {
    console.log(`Fetching next rank for current rank: ${currentRankName}`);
    try {
        const currentRankIndex = ranks.findIndex(rank => rank.name === currentRankName);
        if (currentRankIndex === -1 || currentRankIndex === ranks.length - 1) {
            console.warn(`No next rank found for current rank: ${currentRankName}`);
            return null;
        }
        const nextRank = ranks[currentRankIndex + 1];
        console.log(`Fetched next rank: ${nextRank.name}`);
        return nextRank;
    } catch (error) {
        console.error(`Failed to fetch next rank for current rank ${currentRankName}:`, error);
        return null;
    }
};

// Fetches the previous rank based on the current rank
export const fetchPreviousRank = (currentRankName: string): WorkoutRank | null => {
    console.log(`Fetching previous rank for current rank: ${currentRankName}`);
    try {
        const currentRankIndex = ranks.findIndex(rank => rank.name === currentRankName);
        if (currentRankIndex <= 0) {
            console.warn(`No previous rank found for current rank: ${currentRankName}`);
            return null;
        }
        const previousRank = ranks[currentRankIndex - 1];
        console.log(`Fetched previous rank: ${previousRank.name}`);
        return previousRank;
    } catch (error) {
        console.error(`Failed to fetch previous rank for current rank ${currentRankName}:`, error);
        return null;
    }
};

// Fetches all difficulty levels
export const fetchAllDifficultyLevels = (): WorkoutDifficultyLevel[] | null => {
    console.log("Fetching all difficulty levels...");
    try {
        const levels = difficultyLevels as WorkoutDifficultyLevel[];
        console.log(`Fetched ${levels.length} difficulty levels.`);
        return levels || null;
    } catch (error) {
        console.error("Failed to fetch all difficulty levels:", error);
        return null;
    }
};

// Fetches a specific difficulty level by name
export const fetchDifficultyLevelByName = (levelName: string): WorkoutDifficultyLevel | null => {
    console.log(`Fetching difficulty level by name: ${levelName}`);
    try {
        const level = (difficultyLevels as WorkoutDifficultyLevel[]).find(level => level.name === levelName) || null;
        if (level) {
            console.log(`Fetched difficulty level: ${level.name}`);
        } else {
            console.warn(`Difficulty level ${levelName} not found.`);
        }
        return level;
    } catch (error) {
        console.error(`Failed to fetch difficulty level by name ${levelName}:`, error);
        return null;
    }
};

// Fetches the next difficulty level based on the current level
export const fetchNextDifficultyLevel = (currentLevelName: string): WorkoutDifficultyLevel | null => {
    console.log(`Fetching next difficulty level for current level: ${currentLevelName}`);
    try {
        const currentLevelIndex = (difficultyLevels as WorkoutDifficultyLevel[]).findIndex(level => level.name === currentLevelName);
        if (currentLevelIndex === -1 || currentLevelIndex === (difficultyLevels as WorkoutDifficultyLevel[]).length - 1) {
            console.warn(`No next difficulty level found for current level: ${currentLevelName}`);
            return null;
        }
        const nextLevel = (difficultyLevels as WorkoutDifficultyLevel[])[currentLevelIndex + 1];
        console.log(`Fetched next difficulty level: ${nextLevel.name}`);
        return nextLevel;
    } catch (error) {
        console.error(`Failed to fetch next difficulty level for current level ${currentLevelName}:`, error);
        return null;
    }
};

// Fetches the previous difficulty level based on the current level
export const fetchPreviousDifficultyLevel = (currentLevelName: string): WorkoutDifficultyLevel | null => {
    console.log(`Fetching previous difficulty level for current level: ${currentLevelName}`);
    try {
        const currentLevelIndex = (difficultyLevels as WorkoutDifficultyLevel[]).findIndex(level => level.name === currentLevelName);
        if (currentLevelIndex <= 0) {
            console.warn(`No previous difficulty level found for current level: ${currentLevelName}`);
            return null;
        }
        const previousLevel = (difficultyLevels as WorkoutDifficultyLevel[])[currentLevelIndex - 1];
        console.log(`Fetched previous difficulty level: ${previousLevel.name}`);
        return previousLevel;
    } catch (error) {
        console.error(`Failed to fetch previous difficulty level for current level ${currentLevelName}:`, error);
        return null;
    }
};