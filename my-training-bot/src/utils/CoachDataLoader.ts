import difficultyLevels from "../data/training_coach_data/difficulty_levels.json";
import ranksData from "../data/training_coach_data/ranks.json";
import tigerSpeech from "../data/training_coach_data/tiger_speech.json";
import trainingChallenges from "../data/training_coach_data/training_challenges.json";
import { WorkoutDifficultyLevel } from "../types/WorkoutDifficultyLevel";
import { WorkoutRank } from "../types/WorkoutRank";
import { WorkoutCategory, WorkoutSubCategory, WorkoutGroup, Workout } from "../types/WorkoutCategory";
import { workoutCategoryPaths } from "./workoutCategoryPaths";
import { workoutSubCategoryPaths } from "./workoutSubCategoryPaths";

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
export const fetchWorkoutByCategory = async (category: string, subCategory: string): Promise<Workout | null> => {
    try {
        const categoryData = await workoutCategoryPaths[category]();
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = await workoutSubCategoryPaths[`${category}_${subCategory}`]();
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        const allWorkouts = subCategoryData.workout_groups.flatMap((group: WorkoutGroup) => group.workouts);
        return getRandomItem(allWorkouts);
    } catch (error) {
        console.error(`Failed to fetch workout by category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches a random workout from a specific workout group
export const fetchWorkoutFromGroup = async (category: string, subCategory: string, groupName: string): Promise<Workout | null> => {
    try {
        const categoryData = await workoutCategoryPaths[category]();
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = await workoutSubCategoryPaths[`${category}_${subCategory}`]();
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        const group = subCategoryData.workout_groups.find((group: WorkoutGroup) => group.name === groupName);
        if (!group) {
            console.warn(`Workout group ${groupName} not found in sub-category ${subCategory} of category ${category}.`);
            return null;
        }
        return getRandomItem(group.workouts);
    } catch (error) {
        console.error(`Failed to fetch workout from group ${groupName} in category ${category} and sub-category ${subCategory}:`, error);
        return null;
    }
};

// Fetches all workouts in a specific category
export const fetchAllWorkoutsInCategory = async (category: string): Promise<Workout[] | null> => {
    try {
        const categoryData = await workoutCategoryPaths[category]();
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const workoutsList: Workout[] = [];
        for (const subCategoryId in workoutSubCategoryPaths) {
            if (subCategoryId.startsWith(category)) {
                const subCategoryData = await workoutSubCategoryPaths[subCategoryId]();
                subCategoryData.workout_groups.forEach((group: WorkoutGroup) => {
                    workoutsList.push(...group.workouts);
                });
            }
        }
        return workoutsList;
    } catch (error) {
        console.error(`Failed to fetch all workouts in category ${category}:`, error);
        return null;
    }
};

// Fetches all workouts for a specific workout group
export const fetchAllWorkoutsInGroup = async (category: string, subCategory: string, groupName: string): Promise<Workout[] | null> => {
    try {
        const categoryData = await workoutCategoryPaths[category]();
        if (!categoryData) {
            console.warn(`Category ${category} not found.`);
            return null;
        }
        const subCategoryData = await workoutSubCategoryPaths[`${category}_${subCategory}`]();
        if (!subCategoryData) {
            console.warn(`Sub-category ${subCategory} not found in category ${category}.`);
            return null;
        }
        const group = subCategoryData.workout_groups.find((group: WorkoutGroup) => group.name === groupName);
        if (!group) {
            console.warn(`Workout group ${groupName} not found in sub-category ${subCategory} of category ${category}.`);
            return null;
        }
        return group.workouts || null;
    } catch (error) {
        console.error(`Failed to fetch all workouts in group ${groupName} for category ${category} and sub-category ${subCategory}:`, error);
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
}

class CoachDataLoader {
    async loadWorkoutCategories(): Promise<WorkoutCategory[]> {
        const categories: WorkoutCategory[] = [];

        for (const categoryId in workoutCategoryPaths) {
            try {
                const categoryData = await workoutCategoryPaths[categoryId]();
                if (!categoryData || Object.keys(categoryData).length === 0) {
                    console.warn(`Category ${categoryId} is empty.`);
                    continue;
                }
                const subCategories = await this.loadSubCategories(categoryId, categoryData.subcategories);
                categories.push({
                    id: categoryId,
                    name: categoryData.name,
                    description: categoryData.description,
                    subCategories: subCategories
                });
            } catch (error) {
                console.error(`Failed to load category ${categoryId}:`, error);
            }
        }

        return categories;
    }

    async loadSubCategories(categoryId: string, subCategoryPaths: { [key: string]: string }): Promise<WorkoutSubCategory[]> {
        const subCategories: WorkoutSubCategory[] = [];

        for (const subCategoryId in subCategoryPaths) {
            try {
                const subCategoryData = await workoutSubCategoryPaths[`${categoryId}_${subCategoryId}`]();
                if (!subCategoryData || Object.keys(subCategoryData).length === 0) {
                    console.warn(`Sub-category ${subCategoryId} is empty.`);
                    continue;
                }
                if (!subCategoryData.workout_groups) {
                    console.warn(`Sub-category ${subCategoryId} has no workout groups.`);
                    continue;
                }
                const workoutGroups = subCategoryData.workout_groups.map((group: any) => ({
                    id: group.name.toLowerCase().replace(/\s+/g, '_'),
                    name: group.name,
                    description: group.description,
                    workouts: group.workouts.map((workout: any) => ({
                        id: workout.name.toLowerCase().replace(/\s+/g, '_'),
                        name: workout.name,
                        description: workout.description,
                        duration: workout.duration,
                        intensity: workout.intensity, // Changed from difficulty to intensity
                        difficultyRange: this.parseDifficultyRange(workout.difficulty_range)
                    }))
                }));
                subCategories.push({
                    id: subCategoryId,
                    name: subCategoryData.name,
                    description: subCategoryData.description,
                    workoutGroups: workoutGroups
                });
            } catch (error) {
                console.error(`Failed to load sub-category ${subCategoryId}:`, error);
            }
        }

        return subCategories;
    }

    parseDifficultyRange(difficultyRange: [number, number]): { min: number, max: number } {
        const [min, max] = difficultyRange;
        return { min, max };
    }

    async fetchAllDifficultyLevels(): Promise<WorkoutDifficultyLevel[]> {
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
    }
}

export default CoachDataLoader;