import React, { useEffect, useId, useRef } from 'react';
import styles from './Header.module.css';
import StatsPanel from '../StatsPanel/StatsPanel';
import { OverlayPortal, useBodyScrollLock } from '../../utils/overlayStack';
import HeaderNav from './HeaderNav';
import { resolveHeaderNavItems } from './navConfig';

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
    handlerColor: string;
    summary: Summary;
    renderLogin: () => React.ReactNode;
    activePath: string;
    navigateTo: (path: string) => void;
}

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const HeaderDrawer: React.FC<HeaderDrawerProps> = ({ open, onClose, handlerColor, summary, renderLogin, activePath, navigateTo }) => {
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const resolvedNavItems = React.useMemo(() => resolveHeaderNavItems(), []);
    useBodyScrollLock(open);

    useEffect(() => {
        const drawerEl = drawerRef.current;
        if (!open || !drawerEl) return;

        previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const focusables = Array.from(drawerEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
        const target = focusables[0] || drawerEl;
        requestAnimationFrame(() => target?.focus());

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== 'Tab') return;
            const currentFocusables = Array.from(drawerEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
            if (currentFocusables.length === 0) {
                event.preventDefault();
                drawerEl.focus();
                return;
            }
            const firstEl = currentFocusables[0];
            const lastEl = currentFocusables[currentFocusables.length - 1];
            const active = document.activeElement;
            if (event.shiftKey) {
                if (active === firstEl || active === drawerEl) {
                    event.preventDefault();
                    lastEl.focus();
                }
            } else if (active === lastEl) {
                event.preventDefault();
                firstEl.focus();
            }
        };

        document.addEventListener('keydown', handleKey, true);
        return () => document.removeEventListener('keydown', handleKey, true);
    }, [open, onClose]);

    useEffect(() => {
        if (open) return undefined;
        const previous = previouslyFocusedRef.current;
        if (previous && typeof previous.focus === 'function') {
            previous.focus();
        }
        return undefined;
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[overlay] header-drawer mounted');
        }
        return () => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug('[overlay] header-drawer unmounted');
            }
        };
    }, [open]);

    if (!open) return null;

    return (
        <OverlayPortal>
            <div className={`${styles.drawerOverlay} ${open ? styles.drawerOverlayVisible : ''}`} data-overlay="header-drawer" aria-hidden={!open}>
                <div className={styles.drawer} ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
                    <div className={styles.drawerHeader}>
                        <span className={styles.drawerTitle} id={titleId}>Controls & Stats</span>
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
                    <div className={styles.drawerNav} style={{ '--handler-color': handlerColor } as React.CSSProperties}>
                        <HeaderNav
                            items={resolvedNavItems}
                            activePath={activePath}
                            onNavigate={(path) => {
                                navigateTo(path);
                                onClose();
                            }}
                            orientation="stacked"
                        />
                    </div>
                    <div className={styles.drawerFooter}>
                        <div className={styles.drawerControls}>
                            {renderLogin()}
                        </div>
                    </div>
                </div>
                <button className={styles.drawerBackdrop} aria-label="Close menu" onClick={onClose} />
            </div>
        </OverlayPortal>
    );
};

export default HeaderDrawer;
