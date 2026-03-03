import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './HomeShell.module.css';
import { logEvent } from '../../utils/telemetry';

const tabs = [
    { path: '/home/plan', label: 'Plan' },
    { path: '/home/cards', label: 'Cards' },
    { path: '/home/progress', label: 'Progress' },
    { path: '/home/coach', label: 'Coach' },
    { path: '/home/settings', label: 'Settings' },
];

const HomeShell: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const activePath = tabs.find(tab => location.pathname.startsWith(tab.path))?.path ?? '/home/plan';

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.path === activePath);
        if (currentIndex === -1) return;
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        const nextPath = tabs[nextIndex].path;
        logEvent({ type: 'home_tab_switch', tab: nextPath });
        navigate(nextPath);
    };

    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.shell}>
                <div className={styles.tabSelectRow}>
                    <label className={styles.tabSelectLabel} htmlFor="home-tab-select">Section</label>
                    <select
                        id="home-tab-select"
                        className={styles.tabSelect}
                        value={activePath}
                        onChange={(e) => {
                            logEvent({ type: 'home_tab_switch', tab: e.target.value });
                            navigate(e.target.value);
                        }}
                    >
                        {tabs.map(tab => (
                            <option key={tab.path} value={tab.path}>{tab.label}</option>
                        ))}
                    </select>
                </div>
                <div
                    className={styles.tabBar}
                    role="tablist"
                    aria-label="Home sections"
                    onKeyDown={handleKeyDown}
                >
                    {tabs.map(tab => {
                        const isActive = activePath === tab.path;
                        return (
                            <button
                                key={tab.path}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`section-${tab.label.toLowerCase()}`}
                                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                                onClick={() => navigate(tab.path)}
                                type="button"
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <main id="main-content" className={styles.content} aria-live="polite">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default HomeShell;
