import { SubWorkout } from './SubWorkout';

export interface WorkoutSchedule {
    date: string;
    workouts: SubWorkout[];
}