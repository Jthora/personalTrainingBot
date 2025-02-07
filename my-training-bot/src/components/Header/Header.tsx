import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/images/WingCommanderLogo-288x162.gif';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const navigateToSettings = () => {
        navigate('/settings');
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <img src={logo} alt="Logo" className={styles.logo} />
                <h1 className={styles.headerTitle}>Training Bot</h1>
            </div>
            <button onClick={navigateToSettings} className={styles.settingsButton}>Settings</button>
        </header>
    );
};

export default Header;