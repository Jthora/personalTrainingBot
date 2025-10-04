class WorkoutTimer {
    private startTime: number | null = null;
    private elapsedTime: number = 0;
    private timerId: NodeJS.Timeout | null = null;

    start(): void {
        if (this.timerId) {
            return; // Timer is already running
        }
        this.startTime = Date.now() - this.elapsedTime;
        this.timerId = setInterval(() => {
            this.elapsedTime = Date.now() - (this.startTime as number);
        }, 1000);
    }

    pause(): void {
        if (!this.timerId) {
            return; // Timer is not running
        }
        clearInterval(this.timerId);
        this.timerId = null;
        this.elapsedTime = Date.now() - (this.startTime as number);
    }

    resume(): void {
        if (this.timerId) {
            return; // Timer is already running
        }
        this.startTime = Date.now() - this.elapsedTime;
        this.timerId = setInterval(() => {
            this.elapsedTime = Date.now() - (this.startTime as number);
        }, 1000);
    }

    stop(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
        this.timerId = null;
        this.startTime = null;
        this.elapsedTime = 0;
    }

    getElapsedTime(): number {
        return this.elapsedTime;
    }
}

export default WorkoutTimer;