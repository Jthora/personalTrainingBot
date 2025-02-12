import { Workout } from './WorkoutCategory';
import DifficultySetting from './DifficultySetting';

export interface WorkoutSchedule {
    date: string;
    workouts: Workout[];
    difficultySettings: DifficultySetting; // Add difficultySettings to the interface
}