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
    badge?: string;
    difficultyTags?: string[];
    cards: Card[];
}

export interface DrillCategoryFile {
    name: string;
    description: string;
    subcategories: Record<string, string>;
}

export interface DrillEntryFile {
    name: string;
    duration: string;
    intensity: string;
    description: string;
    difficulty_range: [number, number];
}

export interface DrillGroupFile {
    name: string;
    description: string;
    drills: DrillEntryFile[];
}

export interface DrillSubCategoryFile {
    name: string;
    description: string;
    workout_groups: DrillGroupFile[];
}
