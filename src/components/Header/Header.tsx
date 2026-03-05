import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/images/WingCommanderLogo-288x162.gif';
import UserProgressStore from '../../store/UserProgressStore';
import WorkoutScheduleStore from '../../store/WorkoutScheduleStore';
import { checkScheduleAlignment } from '../../utils/alignmentCheck';
import HeaderNav from './HeaderNav';
import { headerNavItems } from './navConfig';
import useSelectionSummary from '../../hooks/useSelectionSummary';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [summary, setSummary] = useState({
        remaining: 0,
        difficulty: 0,
        streakStatus: 'broken' as 'active' | 'frozen' | 'broken',
        level: 1,
        alignment: 'pass' as 'pass' | 'warn',
        selectionSummary: '',
    });

    const schedule = useMemo(() => WorkoutScheduleStore.getScheduleSync(), [location.pathname]);

    const alignment = useMemo(() => {
        if (!schedule) return 'pass' as const;
        return checkScheduleAlignment(schedule).status;
    }, [schedule?.scheduleItems.length, schedule?.difficultySettings.level]);

    const selectionSummary = useSelectionSummary();

    useEffect(() => {
        const progressVm = UserProgressStore.getViewModel();
        const remaining = schedule?.scheduleItems.length ?? 0;
        const difficulty = schedule?.difficultySettings.level ?? 0;
        setSummary({
            remaining,
            difficulty,
            streakStatus: progressVm.streakStatus,
            level: UserProgressStore.get().level,
            alignment,
            selectionSummary,
        });
    }, [alignment, schedule?.scheduleItems.length, schedule?.difficultySettings.level, selectionSummary]);

    const navigateTo = (path: string) => {
        navigate(path);
    };

    const renderNav = (orientation: 'inline' | 'stacked' = 'inline') => (
        <HeaderNav
            items={headerNavItems}
            activePath={location.pathname}
            onNavigate={navigateTo}
            orientation={orientation}
        />
    );

    return (
        <header className={styles.header}>
            <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
            {/* Left Side - Logo */}
            <div className={styles.leftSection}>
                <div className={styles.logoContainer}>
                    <a
                        href="https://archangel.agency/hub"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit the Archangel Agency hub"
                    >
                        <img src={logo} alt="Wing Commander Logo" className={styles.logo} />
                    </a>
                </div>
            </div>

            {/* Center - Title (hugging the logo) */}
            <div className={styles.centerSection}>
                <h1 className={styles.headerTitle}>Personal Training Bot</h1>
                <div className={styles.chipsRow}>
                    <span className={styles.chip}>📅 {summary.remaining} left</span>
                    <span className={styles.chip}>🎚️ L{summary.difficulty}</span>
                    <span className={`${styles.chip} ${styles.alignment}`} data-state={summary.alignment}>
                        ⚖️ {summary.alignment === 'pass' ? 'Aligned' : 'Check mix'}
                    </span>
                </div>
            </div>

            {/* Right Side - Navigation and Login */}
            <div className={styles.rightSection}>
                {/* Inline nav + controls (kept visible for all breakpoints) */}
                {renderNav()}
                <a className={styles.settingsLink} href="/mission/debrief" aria-label="Open settings">⚙️</a>
            </div>
        </header>
    );
};

export default Header;