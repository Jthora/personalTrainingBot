import React from 'react';
import Header from '../../components/Header/Header';
import CardSelector from '../../components/CardSelector/CardSelector';
import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <h1>Settings Page</h1>
            <CardSelector />
        </div>
    );
};

export default SettingsPage;