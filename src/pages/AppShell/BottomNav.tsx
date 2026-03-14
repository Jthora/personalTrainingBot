import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppShellTab } from './appShellTabs';
import styles from './AppShell.module.css';

interface BottomNavProps {
  tabs: AppShellTab[];
  dueBadge?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ tabs, dueBadge }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (tab: AppShellTab) => location.pathname.startsWith(tab.path);

  // Only show primary (non-mission) tabs in the bottom nav
  const bottomTabs = tabs.filter((t) => !t.missionOnly);

  return (
    <nav className={styles.bottomNav} aria-label="Primary navigation">
      {bottomTabs.map((tab) => (
        <button
          key={tab.path}
          type="button"
          className={`${styles.bottomNavItem} ${isActive(tab) ? styles.bottomNavActive : ''}`}
          aria-current={isActive(tab) ? 'page' : undefined}
          onClick={() => navigate(tab.path)}
        >
          <span className={styles.bottomNavIcon} aria-hidden>
            {tab.icon}
            {tab.label === 'Review' && dueBadge != null && dueBadge > 0 && (
              <span className={styles.bottomNavBadge} aria-label={`${dueBadge} cards due`}>
                {dueBadge > 99 ? '99+' : dueBadge}
              </span>
            )}
          </span>
          <span className={styles.bottomNavLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
