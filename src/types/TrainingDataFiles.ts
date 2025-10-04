import type { Card } from "./Card";

export interface TrainingModuleFile {
    id: string;
    name: string;
    description: string;
    color: string;
    submodules: string[];
}

export interface TrainingSubModuleFile {
    id: string;
    name: string;
    description: string;
    difficulty: "Beginner" | "Light" | "Standard" | "Intermediate" | "Advanced" | "Heavy" | "Challenge" | "Unknown";
    estimated_time: string;
    focus: string[];
    cardDecks: string[];
}

export interface CardDeckFile {
    id: string;
    name: string;
    description: string;
    focus: string[];
    cards: Card[];
}

export interface WorkoutCategoryFile {
    name: string;
    description: string;
    subcategories: Record<string, string>;
}

export interface WorkoutEntryFile {
    name: string;
    duration: string;
    intensity: string;
    description: string;
    difficulty_range: [number, number];
}

export interface WorkoutGroupFile {
    name: string;
    description: string;
    workouts: WorkoutEntryFile[];
}

export interface WorkoutSubCategoryFile {
    name: string;
    description: string;
    workout_groups: WorkoutGroupFile[];
}
