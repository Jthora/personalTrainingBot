import { mark } from "./perf";

type Priority = "high" | "medium" | "low" | "idle";

type Task = {
    label: string;
    priority: Priority;
    run: (signal: AbortSignal) => Promise<void> | void;
    canRunOnSaveData?: boolean;
    allowOn2g?: boolean;
    requiresOnline?: boolean;
    maxDurationMs?: number;
};

type Metrics = {
    scheduled: number;
    completed: number;
    canceled: number;
    skipped: number;
    errors: number;
};

type SchedulerEvent = {
    type: 'scheduled' | 'canceled' | 'canceled-all' | 'run-start' | 'run-end' | 'error' | 'skip';
    label: string;
    timestamp: number;
    detail?: Record<string, unknown>;
};

type SchedulerState = {
    queueLength: number;
    activeLabel: string | null;
    metrics: Metrics;
    lastEvent?: SchedulerEvent;
};

type Logger = (message: string, data?: Record<string, unknown>) => void;

const priorityWeight: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
    idle: 0,
};

const supportsIdle = typeof (globalThis as any).requestIdleCallback === "function";

class TaskScheduler {
    private queue: Task[] = [];
    private running = false;
    private activeController: AbortController | null = null;
    private activeLabel: string | null = null;
    private metrics: Metrics = {
        scheduled: 0,
        completed: 0,
        canceled: 0,
        skipped: 0,
        errors: 0,
    };
    private logger: Logger;
    private listeners: Set<(state: SchedulerState) => void> = new Set();
    private lastEvent: SchedulerEvent | undefined;

    constructor(logger?: Logger) {
        this.logger = logger ?? ((msg, data) => console.info(`[scheduler] ${msg}`, data ?? ""));

        if (typeof window !== "undefined") {
            window.addEventListener("pagehide", () => this.cancelAll("pagehide"));
            window.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    this.cancelAll("hidden");
                }
            });
        }
    }

    public subscribe(listener: (state: SchedulerState) => void): () => void {
        this.listeners.add(listener);
        listener(this.snapshot());
        return () => this.listeners.delete(listener);
    }

    public schedule(task: Task): () => void {
        this.queue.push(task);
        this.metrics.scheduled += 1;
        this.queue.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
        this.emit({ type: 'scheduled', label: task.label, timestamp: performance.now(), detail: { priority: task.priority } });
        this.drain();

        return () => this.cancel(task.label);
    }

    public cancel(label: string) {
        const originalLength = this.queue.length;
        this.queue = this.queue.filter(task => task.label !== label);
        const removed = originalLength - this.queue.length;
        if (this.activeLabel === label && this.activeController) {
            this.activeController.abort();
        }
        const totalRemoved = removed + (this.activeLabel === label ? 1 : 0);
        if (totalRemoved > 0) {
            this.metrics.canceled += totalRemoved;
            this.logger(`canceled ${totalRemoved} task(s) for ${label}`);
            this.emit({ type: 'canceled', label, timestamp: performance.now(), detail: { removed: totalRemoved } });
        }
    }

    public cancelAll(reason: string) {
        const removed = this.queue.length + (this.activeController ? 1 : 0);
        this.queue = [];
        if (this.activeController) {
            this.activeController.abort();
        }
        if (removed > 0) {
            this.metrics.canceled += removed;
            this.logger(`canceled all tasks (${removed}) due to ${reason}`);
            this.emit({ type: 'canceled-all', label: reason, timestamp: performance.now(), detail: { removed } });
        }
    }

    public getMetrics(): Metrics {
        return { ...this.metrics };
    }

    private drain() {
        if (this.running) return;
        this.running = true;
        const step = () => {
            const next = this.queue.shift();
            if (!next) {
                this.running = false;
                return;
            }

            const guardResult = this.shouldRun(next);
            if (!guardResult.allowed) {
                this.metrics.skipped += 1;
                this.logger(`skipped ${next.label} (${guardResult.reason})`);
                step();
                return;
            }

            const controller = new AbortController();
            this.activeController = controller;
            this.activeLabel = next.label;
            const start = performance.now();
            this.logger(`run ${next.label}`, { priority: next.priority });
            mark(`task:start:${next.label}`);
            this.emit({ type: 'run-start', label: next.label, timestamp: start, detail: { priority: next.priority } });

            const exec = async () => {
                try {
                    const runPromise = Promise.resolve(next.run(controller.signal));
                    if (next.maxDurationMs) {
                        const timeout = new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error("timeout")), next.maxDurationMs)
                        );
                        await Promise.race([runPromise, timeout]);
                    } else {
                        await runPromise;
                    }
                    this.metrics.completed += 1;
                    this.logger(`done ${next.label}`, { durationMs: performance.now() - start });
                } catch (error) {
                    if (controller.signal.aborted) {
                        this.metrics.canceled += 1;
                        this.logger(`aborted ${next.label}`);
                        this.emit({ type: 'canceled', label: next.label, timestamp: performance.now() });
                    } else {
                        this.metrics.errors += 1;
                        this.logger(`error in ${next.label}`, { error });
                        this.emit({ type: 'error', label: next.label, timestamp: performance.now(), detail: { error: (error as Error)?.message } });
                    }
                } finally {
                    mark(`task:end:${next.label}`);
                    this.activeController = null;
                    this.activeLabel = null;
                    this.emit({ type: 'run-end', label: next.label, timestamp: performance.now(), detail: { durationMs: performance.now() - start } });
                    step();
                }
            };

            if (next.priority === "idle") {
                this.runIdle(exec);
            } else {
                setTimeout(exec, 0);
            }
        };

        step();
    }

    private runIdle(exec: () => void) {
        if (supportsIdle) {
            (globalThis as any).requestIdleCallback(exec, { timeout: 1000 });
        } else {
            setTimeout(exec, 150);
        }
    }

    private shouldRun(task: Task): { allowed: boolean; reason?: string } {
        const connection = (navigator as any)?.connection as { saveData?: boolean; effectiveType?: string } | undefined;
        if (connection?.saveData && task.canRunOnSaveData === false) {
            return { allowed: false, reason: "saveData" };
        }
        if (connection?.effectiveType === "2g" && task.allowOn2g === false) {
            return { allowed: false, reason: "2g-network" };
        }
        if (task.requiresOnline && typeof navigator !== "undefined" && navigator.onLine === false) {
            return { allowed: false, reason: "offline" };
        }
        return { allowed: true };
    }

    private emit(event: SchedulerEvent) {
        this.lastEvent = event;
        const state = this.snapshot();
        this.listeners.forEach(listener => listener(state));
        this.logger(`state`, { queueLength: state.queueLength, active: state.activeLabel, event: event.type });
    }

    private snapshot(): SchedulerState {
        return {
            queueLength: this.queue.length,
            activeLabel: this.activeLabel,
            metrics: { ...this.metrics },
            lastEvent: this.lastEvent,
        };
    }
}

export const taskScheduler = new TaskScheduler();
export type { Task, Priority, Metrics, SchedulerState };
