import { Workout } from './WorkoutCategory';
import { DifficultySetting } from './DifficultySetting';

export class WorkoutSchedule {
    date: string;
    scheduleItems: (WorkoutSet | WorkoutBlock)[];
    difficultySettings: DifficultySetting;

    constructor(date: string, scheduleItems: (WorkoutSet | WorkoutBlock)[], difficultySettings: DifficultySetting) {
        this.date = date;
        this.scheduleItems = scheduleItems;
        this.difficultySettings = difficultySettings;
    }
}

export type WorkoutSet = { workouts: [Workout, boolean][] };

export class WorkoutBlock {
    name: string;
    description: string;
    duration: number; // duration in minutes
    intervalDetails: string;

    constructor(name: string, description: string, duration: number, intervalDetails: string) {
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.intervalDetails = intervalDetails;
    }

    handleTimerExpiration(nextWorkoutSet: WorkoutSet) {
        // Logic to handle timer expiration and trigger the next workout set
        console.log(`Timer expired for ${this.name}. Starting next workout set.`);
        nextWorkoutSet.workouts.forEach(workout => workout[1] = false); // Reset completion state for the next workout set
    }
}