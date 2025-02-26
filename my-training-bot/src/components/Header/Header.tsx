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
                <h1 className={styles.headerTitle}>Personal Training Bot</h1>
            </div>
            <nav className={styles.nav}>
                <button 
                    onClick={() => navigateTo('/')} 
                    className={`${styles.navButton} ${isActive('/') ? styles.active : ''}`}
                >
                    Home
                </button>
                <button 
                    onClick={() => navigateTo('/schedules')} 
                    className={`${styles.navButton} ${isActive('/schedules') ? styles.active : ''}`}
                >
                    Schedules
                </button>
                <button 
                    onClick={() => navigateTo('/workouts')} 
                    className={`${styles.navButton} ${isActive('/workouts') ? styles.active : ''}`}
                >
                    Workouts
                </button>
                <button 
                    onClick={() => navigateTo('/training')} 
                    className={`${styles.navButton} ${isActive('/training') ? styles.active : ''}`}
                >
                    Training
                </button>
                <button 
                    onClick={() => navigateTo('/settings')} 
                    className={`${styles.navButton} ${isActive('/settings') ? styles.active : ''}`}
                >
                    Settings
                </button>
            </nav>
        </header>
    );
};

export default Header;