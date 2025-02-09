import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/images/WingCommanderLogo-288x162.gif';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigateTo = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <img src={logo} alt="Logo" className={styles.logo} />
                <h1 className={styles.headerTitle}>Training Bot</h1>
            </div>
            <nav className={styles.nav}>
                <button 
                    onClick={() => navigateTo('/')} 
                    className={`${styles.navButton} ${isActive('/') ? styles.active : ''}`}
                >
                    Home
                </button> | 
                <button 
                    onClick={() => navigateTo('/training-sequence')} 
                    className={`${styles.navButton} ${isActive('/training-sequence') ? styles.active : ''}`}
                >
                    Training Sequence
                </button> | 
                <button 
                    onClick={() => navigateTo('/settings')} 
                    className={`${styles.navButton} ${isActive('/settings') ? styles.active : ''}`}
                >
                    Settings
                </button> | 
                <button 
                    onClick={() => navigateTo('/schedule')} 
                    className={`${styles.navButton} ${isActive('/schedule') ? styles.active : ''}`}
                >
                    Schedule
                </button>
            </nav>
        </header>
    );
};

export default Header;