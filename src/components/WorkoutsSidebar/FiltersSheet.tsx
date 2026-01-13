import React, { useEffect, useRef } from 'react';
import styles from './FiltersSheet.module.css';
import DifficultySettings from '../DifficultySettings/DifficultySettings';
import WorkoutFilters from '../WorkoutFilters/WorkoutFilters';

interface FiltersSheetProps {
    open: boolean;
    target?: 'filters' | 'difficulty' | null;
    onClose: () => void;
}

const FiltersSheet: React.FC<FiltersSheetProps> = ({ open, target, onClose }) => {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const lastFocusedRef = useRef<HTMLElement | null>(null);
    const difficultyRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return undefined;
        lastFocusedRef.current = document.activeElement as HTMLElement | null;

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
            if (event.key === 'Tab') {
                const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable || focusable.length === 0) return;
                const focusableArray = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
                if (focusableArray.length === 0) return;
                const first = focusableArray[0];
                const last = focusableArray[focusableArray.length - 1];
                const active = document.activeElement as HTMLElement;
                if (event.shiftKey) {
                    if (active === first || !dialogRef.current?.contains(active)) {
                        event.preventDefault();
                        last.focus();
                    }
                } else if (active === last || !dialogRef.current?.contains(active)) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = previousOverflow;
            if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
                lastFocusedRef.current.focus();
            }
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open && dialogRef.current) {
            dialogRef.current.focus();

            // scroll to requested target within the sheet
            const targetEl = target === 'difficulty'
                ? difficultyRef.current || dialogRef.current.querySelector<HTMLElement>('#difficulty-controls')
                : null;
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (typeof targetEl.focus === 'function') {
                    targetEl.focus();
                }
            }
        }
    }, [open, target]);

    if (!open) return null;

    return (
        <div className={styles.backdrop} role="presentation">
            <div
                className={styles.sheet}
                role="dialog"
                aria-modal="true"
                aria-label="Filters and presets"
                ref={dialogRef}
                tabIndex={-1}
            >
                <div className={styles.sheetHeader}>
                    <div>
                        <p className={styles.eyebrow}>Plan tuning</p>
                        <h2>Filters & presets</h2>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close filters">✕</button>
                </div>

                <div className={styles.sheetContent}>
                    <section aria-label="Difficulty settings" className={styles.section} id="difficulty-controls" ref={difficultyRef}>
                        <h3>Difficulty</h3>
                        <DifficultySettings />
                    </section>

                    <section aria-label="Workout filters" className={styles.section}>
                        <WorkoutFilters />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FiltersSheet;
