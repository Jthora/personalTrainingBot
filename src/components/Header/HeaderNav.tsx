import React from 'react';
import styles from './Header.module.css';
import { HeaderResolvedNavItem } from './navConfig';

interface HeaderNavProps {
    items: HeaderResolvedNavItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    orientation?: 'inline' | 'stacked';
}

const HeaderNav: React.FC<HeaderNavProps> = ({ items, activePath, onNavigate, orientation = 'inline' }) => {
    const isActive = (item: HeaderResolvedNavItem) => item.activePaths.includes(activePath);
    const navClass = orientation === 'inline' ? styles.nav : styles.drawerNav;

    return (
        <nav className={navClass} aria-label="Primary">
            {items.map((item) => (
                <button
                    key={item.path}
                    onClick={() => onNavigate(item.navigatePath)}
                    className={`${styles.navButton} ${isActive(item) ? styles.active : ''}`}
                    aria-current={isActive(item) ? 'page' : undefined}
                    type="button"
                >
                    {item.icon && <span aria-hidden>{item.icon}</span>} {item.label}
                </button>
            ))}
        </nav>
    );
};

export default HeaderNav;
