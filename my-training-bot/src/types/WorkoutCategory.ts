export class WorkoutCategory {
    id: string;
    name: string;
    description: string;
    subCategories: WorkoutSubCategory[];

    constructor(id: string, name: string, description: string, subCategories: WorkoutSubCategory[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.subCategories = subCategories;
    }
}

export class WorkoutSubCategory {
    id: string;
    name: string;
    description: string;
    workoutGroups: WorkoutGroup[];

    constructor(id: string, name: string, description: string, workoutGroups: WorkoutGroup[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.workoutGroups = workoutGroups;
    }
}

export class WorkoutGroup {
    id: string;
    name: string;
    description: string;
    workouts: Workout[];

    constructor(name: string, description: string, workouts: Workout[]) {
        this.id = name.toLowerCase().replace(/\s+/g, '_');
        this.name = name;
        this.description = description;
        this.workouts = workouts;
    }
}

export class Workout {
    id: string;
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: [number, number];

    constructor(name: string, description: string, duration: string, intensity: string, difficulty_range: [number, number]) {
        this.id = name.toLowerCase().replace(/\s+/g, '_');
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.intensity = intensity;
        this.difficulty_range = difficulty_range;
    }
}

export type SelectedWorkoutCategories = { [key: string]: boolean };