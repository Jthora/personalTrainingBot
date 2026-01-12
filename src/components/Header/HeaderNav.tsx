import React from 'react';
import styles from './Header.module.css';
import { HeaderNavItem } from './navConfig';

interface HeaderNavProps {
    items: HeaderNavItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    orientation?: 'inline' | 'stacked';
}

const HeaderNav: React.FC<HeaderNavProps> = ({ items, activePath, onNavigate, orientation = 'inline' }) => {
    const isActive = (path: string) => activePath === path;
    const navClass = orientation === 'inline' ? styles.nav : styles.drawerNav;

    return (
        <nav className={navClass} aria-label="Primary">
            {items.map((item) => (
                <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className={`${styles.navButton} ${isActive(item.path) ? styles.active : ''}`}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                    type="button"
                >
                    {item.icon && <span aria-hidden>{item.icon}</span>} {item.label}
                </button>
            ))}
        </nav>
    );
};

export default HeaderNav;
