import { Workout } from './WorkoutCategory';
import { DifficultySetting } from './DifficultySetting';

export class WorkoutSchedule {
    date: string;
    workouts: Workout[];
    difficultySettings: DifficultySetting;

    constructor(date: string, workouts: Workout[], difficultySettings: DifficultySetting) {
        this.date = date;
        this.workouts = workouts;
        this.difficultySettings = difficultySettings;
    }
}