import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const navigateToSettings = () => {
        navigate('/settings');
    };

    return (
        <header className={styles.header}>
            <button onClick={navigateToSettings} className={styles.settingsButton}>Settings</button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="../assets/images/WingCommanderLogo-288x162.gif" alt="Logo" className={styles.logo} />
                <h1>Training Bot</h1>
            </div>
        </header>
    );
};

export default Header;