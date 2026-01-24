import { useEffect, useMemo, useState } from "react";
import { taskScheduler, type SchedulerState } from "../../utils/taskScheduler";
import styles from "./SchedulerOverlay.module.css";

const STORAGE_KEY = "DEBUG_SCHEDULER_OVERLAY";

const formatMs = (ms?: number) => (ms !== undefined ? `${ms.toFixed(1)} ms` : "-");

const SchedulerOverlay: React.FC = () => {
    const [visible, setVisible] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
    const [state, setState] = useState<SchedulerState>(() => ({
        queueLength: 0,
        activeLabel: null,
        metrics: { scheduled: 0, completed: 0, canceled: 0, skipped: 0, errors: 0 },
        lastEvent: undefined,
    }));

    useEffect(() => {
        const unsubscribe = taskScheduler.subscribe((snapshot) => {
            setState(snapshot);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, visible ? "true" : "false");
    }, [visible]);

    const lastEventDetail = useMemo(() => {
        if (!state.lastEvent) return null;
        const { type, label, timestamp, detail } = state.lastEvent;
        const when = new Date(timestamp).toLocaleTimeString();
        return { type, label, when, detail };
    }, [state.lastEvent]);

    if (!visible) {
        return (
            <button
                className={styles.overlayToggle}
                onClick={() => setVisible(true)}
                aria-label="Show scheduler overlay"
            >
                Scheduler Overlay
            </button>
        );
    }

    return (
        <>
            <button
                className={styles.overlayToggle}
                onClick={() => setVisible(false)}
                aria-label="Hide scheduler overlay"
            >
                Hide Overlay
            </button>
            <div className={styles.panel} role="status" aria-live="polite">
                <div className={styles.header}>
                    <span>Scheduler</span>
                    <button className={styles.linkButton} onClick={() => taskScheduler.cancelAll("overlay-reset")}>Cancel all</button>
                </div>
                <div className={styles.body}>
                    <div className={styles.row}>
                        <span className={styles.label}>Queue</span>
                        <span className={styles.value}>{state.queueLength}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Active</span>
                        <span className={styles.value}>{state.activeLabel ?? "-"}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Scheduled</span>
                        <span className={styles.value}>{state.metrics.scheduled}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Completed</span>
                        <span className={styles.value}>{state.metrics.completed}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Canceled</span>
                        <span className={styles.value}>{state.metrics.canceled}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Skipped</span>
                        <span className={styles.value}>{state.metrics.skipped}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Errors</span>
                        <span className={styles.value}>{state.metrics.errors}</span>
                    </div>
                    {lastEventDetail && (
                        <div className={styles.event}>
                            <div className={styles.eventTitle}>{lastEventDetail.type} — {lastEventDetail.label}</div>
                            <div className={styles.eventMeta}>
                                <span>{lastEventDetail.when}</span>
                                <span>{lastEventDetail.detail?.durationMs ? formatMs(lastEventDetail.detail.durationMs as number) : ""}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SchedulerOverlay;
