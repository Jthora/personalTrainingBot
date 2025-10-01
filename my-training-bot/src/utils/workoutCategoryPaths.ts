import type { WorkoutCategoryFile } from "../types/TrainingDataFiles";
import { createJsonLoader } from "./jsonLoader";

export const workoutCategoryPaths = {
    aegis_fang_combat_system: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/aegis_fang_combat_system.json")),
    agility: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/agility.json")),
    balance: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/balance.json")),
    cardio: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/cardio.json")),
    combat: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/combat.json")),
    coordination: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/coordination.json")),
    endurance: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/endurance.json")),
    jono_thora: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/jono_thora.json")),
    mental: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/mental.json")),
    mobility: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/mobility.json")),
    strength: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/strength.json")),
    superhero: createJsonLoader<WorkoutCategoryFile>(() => import("../data/training_coach_data/workouts/superhero.json"))
} satisfies Record<string, () => Promise<WorkoutCategoryFile>>;

export const totalWorkoutCategories = 12;
