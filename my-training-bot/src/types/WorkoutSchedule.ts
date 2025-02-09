import { Workout } from './Workout';

export interface WorkoutSchedule {
    date: string;
    workouts: Workout[];
}