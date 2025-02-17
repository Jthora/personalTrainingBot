export const workoutCategoryPaths: { [key: string]: () => Promise<any> } = {
    agility: () => import("../data/training_coach_data/workouts/agility.json"),
    balance: () => import("../data/training_coach_data/workouts/balance.json"),
    cardio: () => import("../data/training_coach_data/workouts/cardio.json"),
    combat: () => import("../data/training_coach_data/workouts/combat.json"),
    coordination: () => import("../data/training_coach_data/workouts/coordination.json"),
    endurance: () => import("../data/training_coach_data/workouts/endurance.json"),
    jono_thora: () => import("../data/training_coach_data/workouts/jono_thora.json"),
    mental: () => import("../data/training_coach_data/workouts/mental.json"),
    mobility: () => import("../data/training_coach_data/workouts/mobility.json"),
    strength: () => import("../data/training_coach_data/workouts/strength.json"),
    superhero: () => import("../data/training_coach_data/workouts/superhero.json")
};

export const totalWorkoutCategories = Object.keys(workoutCategoryPaths).length;
