import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WorkoutSchedule, WorkoutSet, WorkoutBlock } from '../../types/WorkoutSchedule';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { cloneScheduleItems, describeScheduleItem, moveScheduleItem, removeScheduleItem, ScheduleItem, getAlignmentStatus, adjustSetDifficulty, replaceSetWithSimilar } from '../../utils/schedulePreview';
import WorkoutCategoryCache from '../../cache/WorkoutCategoryCache';
import { recordMetric } from '../../utils/metrics';
import styles from './PreviewDrawer.module.css';

interface PreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const PreviewDrawer: React.FC<PreviewDrawerProps> = ({ isOpen, onClose }) => {
    const { schedule, setCurrentSchedule, scheduleVersion, isLoading } = useWorkoutSchedule();
    const [draftItems, setDraftItems] = useState<ScheduleItem[]>([]);
    const [dirty, setDirty] = useState(false);
    const drawerRef = useRef<HTMLElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLOListElement | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [itemEstimate, setItemEstimate] = useState(120);
    const [viewportHeight, setViewportHeight] = useState(320);
    const overscan = 4;

    useEffect(() => {
        if (!isOpen) return;
        setDraftItems(cloneScheduleItems(schedule.scheduleItems));
        setDirty(false);
        setScrollTop(0);
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [schedule.scheduleItems, scheduleVersion, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        recordMetric('preview_drawer_open', { items: schedule.scheduleItems.length, difficulty: schedule.difficultySettings.level });
    }, [isOpen, schedule.scheduleItems.length, schedule.difficultySettings.level]);

    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const measure = () => {
            const firstItem = list.querySelector<HTMLElement>('li[data-virtual-item="true"]') || list.querySelector<HTMLElement>('li');
            if (firstItem) {
                const height = firstItem.getBoundingClientRect().height;
                if (height > 0) setItemEstimate(height);
            }
            setViewportHeight(list.clientHeight || viewportHeight);
        };
        measure();
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        return () => observer.disconnect();
    }, [draftItems.length, viewportHeight]);

    const totalDuration = useMemo(() => {
        return draftItems.reduce((sum, item) => {
            if (item instanceof WorkoutBlock) return sum + item.duration;
            const first = item.workouts[0]?.[0]?.durationMinutes;
            return sum + (first || 0);
        }, 0);
    }, [draftItems]);

    const totalHeight = Math.max(itemEstimate * draftItems.length, viewportHeight);
    const visibleCount = Math.ceil(viewportHeight / itemEstimate) + overscan * 2;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemEstimate) - overscan);
    const endIndex = Math.min(draftItems.length, startIndex + visibleCount);
    const paddingTop = startIndex * itemEstimate;
    const paddingBottom = Math.max(totalHeight - paddingTop - (endIndex - startIndex) * itemEstimate, 0);

    const handleMove = (index: number, delta: number) => {
        setDraftItems((prev) => {
            const next = moveScheduleItem(prev, index, index + delta);
            if (next === prev) return prev;
            setDirty(true);
            recordMetric('preview_drawer_reorder', { from: index, to: index + delta, total: prev.length });
            return next;
        });
    };

    const handleRemove = (index: number) => {
        setDraftItems((prev) => {
            const next = removeScheduleItem(prev, index);
            if (next === prev) return prev;
            setDirty(true);
            return next;
        });
    };

    const handleReset = () => {
        setDraftItems(cloneScheduleItems(schedule.scheduleItems));
        setDirty(false);
    };

    const handleApply = () => {
        const updated = new WorkoutSchedule(schedule.date, draftItems, schedule.difficultySettings);
        setCurrentSchedule(updated);
        setDirty(false);
        recordMetric('preview_drawer_apply', { items: draftItems.length, difficulty: schedule.difficultySettings.level });
        onClose();
    };

    const handleClose = useCallback((reason: string) => {
        recordMetric('preview_drawer_close', { reason, dirty, items: draftItems.length });
        onClose();
    }, [dirty, draftItems.length, onClose]);

    const focusFirst = useCallback(() => {
        const drawer = drawerRef.current;
        if (!drawer) return;
        const focusable = drawer.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        focusFirst();
        const handleKeyDown = (event: KeyboardEvent) => {
            const drawer = drawerRef.current;
            if (!drawer) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                handleClose('escape');
                return;
            }
            if (event.key !== 'Tab') return;
            const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )).filter(el => !el.hasAttribute('disabled'));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [focusFirst, handleClose, isOpen]);

    if (!isOpen) return null;

    return (
        <aside
            ref={drawerRef}
            className={styles.drawer}
            aria-label="Workout preview drawer"
            role="dialog"
            aria-modal="true"
        >
            <div className={styles.header}>
                <div>
                    <div className={styles.title}>Preview & reorder</div>
                    <div className={styles.meta} aria-live="polite">{draftItems.length} items · {totalDuration || '—'} min est.</div>
                </div>
                <button
                    ref={closeButtonRef}
                    onClick={() => handleClose('close-button')}
                    className={styles.closeButton}
                    aria-label="Close preview drawer"
                >
                    ×
                </button>
            </div>

            {draftItems.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No items in the current schedule.</p>
                    <p className={styles.hint}>Generate a new schedule or add items to preview them here.</p>
                </div>
            ) : (
                <ol
                    className={styles.list}
                    ref={listRef}
                    onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                    aria-live="polite"
                >
                    {paddingTop > 0 && (
                        <li style={{ height: paddingTop }} aria-hidden data-virtual-spacer="top" />
                    )}
                    {draftItems.slice(startIndex, endIndex).map((item, visibleIndex) => {
                        const index = startIndex + visibleIndex;
                        const alignment = getAlignmentStatus(item, schedule.difficultySettings.level);
                        const alignmentLabel = alignment === 'warn' ? 'Out of difficulty range' : alignment === 'aligned' ? 'Aligned to difficulty' : 'Neutral block';
                        return (
                        <li
                            key={`${item instanceof WorkoutBlock ? 'block' : 'set'}-${index}-${describeScheduleItem(item)}`}
                            className={styles.listItem}
                            tabIndex={0}
                            role="listitem"
                            aria-label={`${describeScheduleItem(item)}. ${alignmentLabel}. Use Alt+Arrow keys to move, Delete to remove.`}
                            data-virtual-item="true"
                            style={{ minHeight: itemEstimate }}
                            onKeyDown={(e) => {
                                if (e.altKey && e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    handleMove(index, -1);
                                }
                                if (e.altKey && e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    handleMove(index, 1);
                                }
                                if (e.key === 'Delete' || e.key === 'Backspace') {
                                    e.preventDefault();
                                    handleRemove(index);
                                }
                            }}
                        >
                            <div className={styles.itemMeta}>
                                <span className={styles.badge}>{item instanceof WorkoutBlock ? 'Block' : 'Set'}</span>
                                <div className={styles.itemTitle}>{describeScheduleItem(item)}</div>
                                <div className={`${styles.alignment} ${styles[alignment]}`} aria-label={alignmentLabel}>
                                    {alignment === 'warn' ? '⚠' : alignment === 'aligned' ? '✓' : '·'} {alignmentLabel}
                                </div>
                                {item instanceof WorkoutSet && (
                                    <>
                                    <div className={styles.subText}>{item.workouts.map(([workout]) => workout.name).join(' · ')}</div>
                                    <div className={styles.inlineControl}>
                                        <span className={styles.inlineLabel}>Target level</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDraftItems(prev => {
                                                    const next = [...prev];
                                                    next[index] = adjustSetDifficulty(item, (schedule.difficultySettings.level || 1) - 1);
                                                    return next;
                                                });
                                                setDirty(true);
                                            }}
                                            aria-label="Nudge difficulty down"
                                        >
                                            –
                                        </button>
                                        <span className={styles.inlineValue}>{Math.round((item.workouts[0]?.[0]?.difficulty_range[0] + item.workouts[0]?.[0]?.difficulty_range[1]) / 2)}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDraftItems(prev => {
                                                    const next = [...prev];
                                                    next[index] = adjustSetDifficulty(item, (schedule.difficultySettings.level || 1) + 1);
                                                    return next;
                                                });
                                                setDirty(true);
                                            }}
                                            aria-label="Nudge difficulty up"
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.ghost}
                                            onClick={() => {
                                                const cache = WorkoutCategoryCache.getInstance();
                                                const pool = cache.getAllWorkouts();
                                                setDraftItems(prev => {
                                                    const next = [...prev];
                                                    next[index] = replaceSetWithSimilar(item, pool, schedule.difficultySettings.level || 1);
                                                    return next;
                                                });
                                                setDirty(true);
                                                recordMetric('preview_drawer_replace', { index, level: schedule.difficultySettings.level });
                                            }}
                                            aria-label="Replace set with similar workouts"
                                        >
                                            Replace with similar
                                        </button>
                                    </div>
                                    </>
                                )}
                                {item instanceof WorkoutBlock && (
                                    <div className={styles.subText}>{item.duration} min · {item.intervalDetails}</div>
                                )}
                            </div>
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    onClick={() => handleMove(index, -1)}
                                    disabled={index === 0}
                                    aria-label="Move item up"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMove(index, 1)}
                                    disabled={index === draftItems.length - 1}
                                    aria-label="Move item down"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    aria-label="Remove item"
                                >
                                    ✕
                                </button>
                            </div>
                        </li>
                    );})}
                    {paddingBottom > 0 && (
                        <li style={{ height: paddingBottom }} aria-hidden data-virtual-spacer="bottom" />
                    )}
                </ol>
            )}

            <div className={styles.footer}>
                <button type="button" onClick={handleReset} disabled={isLoading || (!dirty && draftItems.length > 0)}>
                    Cancel changes
                </button>
                <button type="button" onClick={handleApply} disabled={!dirty || isLoading} className={styles.primary}>
                    Apply changes
                </button>
            </div>
        </aside>
    );
};

export default PreviewDrawer;
