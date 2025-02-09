import { SubWorkout } from "./SubWorkout";

export type Workout = {
    name: string;
    description: string;
    sub_workouts: SubWorkout[];
};