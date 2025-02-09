import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/images/WingCommanderLogo-288x162.gif';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const navigateTo = (path: string) => {
        navigate(path);
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <img src={logo} alt="Logo" className={styles.logo} />
                <h1 className={styles.headerTitle}>Training Bot</h1>
            </div>
            <nav className={styles.nav}>
                <button onClick={() => navigateTo('/')} className={styles.navButton}>Home</button> | 
                <button onClick={() => navigateTo('/training-sequence')} className={styles.navButton}>Training Sequence</button> | 
                <button onClick={() => navigateTo('/settings')} className={styles.navButton}>Settings</button> | 
                <button onClick={() => navigateTo('/schedule')} className={styles.navButton}>Schedule</button>
            </nav>
        </header>
    );
};

export default Header;