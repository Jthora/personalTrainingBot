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

    completeNextItem() {
        console.log('WorkoutSchedule: completeNextItem called');
        if (this.scheduleItems.length === 0) {
            console.log('WorkoutSchedule: No items to complete');
            return;
        }

        const currentItem = this.scheduleItems[0];
        console.log('WorkoutSchedule: Current item:', currentItem);

        if (currentItem instanceof WorkoutSet) {
            for (let i = 0; i < currentItem.workouts.length; i++) {
                if (!currentItem.workouts[i][1]) {
                    console.log(`WorkoutSchedule: Completing workout at index ${i}:`, currentItem.workouts[i][0]);
                    currentItem.workouts[i][1] = true;
                    this.scheduleItems[0] = new WorkoutSet(currentItem.workouts);
                    return;
                }
            }
            console.log('WorkoutSchedule: All workouts in the set are completed. Removing completed WorkoutSet');
            this.scheduleItems.shift();
        } else {
            console.log('WorkoutSchedule: Completing WorkoutBlock:', currentItem);
            this.scheduleItems.shift();
        }
    }

    skipNextItem() {
        console.log('WorkoutSchedule: skipNextItem called');
        if (this.scheduleItems.length === 0) {
            console.log('WorkoutSchedule: No items to skip');
            return;
        }

        const currentItem = this.scheduleItems[0];
        console.log('WorkoutSchedule: Current item:', currentItem);

        if (currentItem instanceof WorkoutSet) {
            for (let i = 0; i < currentItem.workouts.length; i++) {
                if (!currentItem.workouts[i][1]) {
                    console.log(`WorkoutSchedule: Skipping workout at index ${i}:`, currentItem.workouts[i][0]);
                    currentItem.workouts[i][1] = true;
                    this.scheduleItems[0] = new WorkoutSet(currentItem.workouts);
                    return;
                }
            }
            console.log('WorkoutSchedule: All workouts in the set are completed. Removing completed WorkoutSet');
            this.scheduleItems.shift();
        } else {
            console.log('WorkoutSchedule: Skipping WorkoutBlock:', currentItem);
            this.scheduleItems.shift();
        }
    }
}

export class WorkoutSet {
    workouts: [Workout, boolean][];

    constructor(workouts: [Workout, boolean][]) {
        this.workouts = workouts;
    }

    get allWorkoutsCompleted(): boolean {
        return this.workouts.every(([_, completed]) => completed);
    }
}

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