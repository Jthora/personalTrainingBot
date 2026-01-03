import React, { useEffect, useRef } from 'react';
import styles from './Header.module.css';
import StatsPanel from '../StatsPanel/StatsPanel';

interface Summary {
    remaining: number;
    difficulty: number;
    streakStatus: 'active' | 'frozen' | 'broken';
    level: number;
    alignment: 'pass' | 'warn';
    selectionSummary: string;
}

interface HeaderDrawerProps {
    open: boolean;
    onClose: () => void;
    coachColor: string;
    summary: Summary;
    renderNav: () => React.ReactNode;
    renderLogin: () => React.ReactNode;
    renderThemeToggle: () => React.ReactNode;
}

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const HeaderDrawer: React.FC<HeaderDrawerProps> = ({ open, onClose, coachColor, summary, renderNav, renderLogin, renderThemeToggle }) => {
    const drawerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const drawerEl = drawerRef.current;
        if (!drawerEl) return;
        const first = drawerEl.querySelector<HTMLElement>(focusableSelector);
        first?.focus();

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusables = Array.from(drawerEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
            if (focusables.length === 0) return;
            const firstEl = focusables[0];
            const lastEl = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === firstEl) {
                event.preventDefault();
                lastEl.focus();
            } else if (!event.shiftKey && document.activeElement === lastEl) {
                event.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener('keydown', handleKey, true);
        return () => document.removeEventListener('keydown', handleKey, true);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.drawerOverlay}>
            <div className={styles.drawer} ref={drawerRef} role="dialog" aria-modal="true" aria-label="Header menu">
                <div className={styles.drawerHeader} tabIndex={-1}>
                    <span className={styles.drawerTitle}>Controls & Stats</span>
                    <button className={styles.drawerClose} onClick={onClose} aria-label="Close menu">
                        ✕
                    </button>
                </div>
                <div className={styles.drawerChips}>
                    <span className={styles.chip}>📅 {summary.remaining} left</span>
                    <span className={styles.chip}>🎚️ L{summary.difficulty}</span>
                    <span className={`${styles.chip} ${styles.streak}`} data-state={summary.streakStatus}>
                        🔥 {summary.streakStatus === 'active' ? 'On' : summary.streakStatus === 'frozen' ? 'Frozen' : 'Reset'}
                    </span>
                    <span className={styles.chip}>🧭 Lv {summary.level}</span>
                    <span className={`${styles.chip} ${styles.alignment}`} data-state={summary.alignment}>
                        ⚖️ {summary.alignment === 'pass' ? 'Aligned' : 'Check mix'}
                    </span>
                    <span className={styles.chip}>🧾 {summary.selectionSummary}</span>
                </div>
                <div className={styles.drawerStats}>
                    <StatsPanel />
                </div>
                <div className={styles.drawerNav} style={{ '--coach-color': coachColor } as React.CSSProperties}>
                    {renderNav()}
                </div>
                <div className={styles.drawerFooter}>
                    <div className={styles.drawerControls}>
                        {renderThemeToggle()}
                        {renderLogin()}
                    </div>
                </div>
            </div>
            <button className={styles.drawerBackdrop} aria-label="Close menu" onClick={onClose} />
        </div>
    );
};

export default HeaderDrawer;
