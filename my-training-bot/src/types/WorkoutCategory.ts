export interface WorkoutCategory {
    id: string;
    name: string;
    description: string;
    subCategories: WorkoutSubCategory[];
}

export interface WorkoutSubCategory {
    id: string;
    name: string;
    description: string;
    workoutGroups: WorkoutGroup[];
}

export interface WorkoutGroup {
    id: string;
    name: string;
    description: string;
    workouts: Workout[];
}

export interface Workout {
    id: string;
    name: string;
    description: string;
    duration: number;
    intensity: string; // Changed from difficulty to intensity
    difficulty_range: [number, number];
}