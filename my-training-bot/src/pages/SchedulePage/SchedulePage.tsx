import styles from './SchedulePage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';

const SchedulePage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <h1>Schedule Page</h1>
        </div>
    );
};

export default SchedulePage;