import styles from './SettingsPage.module.css';
import React from 'react';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <nav className={styles.nav}>
                <Link to="/">Home</Link> | <Link to="/training-sequence">Training Sequence</Link> | <Link to="/settings">Settings</Link> | <Link to="/schedule">Schedule</Link>
            </nav>
            <h1>Settings Page</h1>
        </div>
    );
};

export default SettingsPage;