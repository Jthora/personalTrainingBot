export type Workout = {
    name: string;
    description: string;
    sub_workouts: SubWorkout[];
};

export type SubWorkout = {
    name: string;
    duration: string;
    intensity: string;
    description: string;
};

export type Category = {
    [key: string]: Workout[];
};

export type WorkoutsData = {
    [key: string]: Category;
};

export type Rank = {
    name: string;
    description: string;
};

export type DifficultyLevel = {
    name: string;
    description: string;
};