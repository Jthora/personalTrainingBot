import styles from './TrainingSequencePage.module.css';
import React from 'react';
import { Link } from 'react-router-dom';

const TrainingSequencePage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <nav className={styles.nav}>
                <Link to="/">Home</Link> | <Link to="/training-sequence">Training Sequence</Link> | <Link to="/settings">Settings</Link> | <Link to="/schedule">Schedule</Link>
            </nav>
            <h1>Training Sequence Page</h1>
        </div>
    );
};

export default TrainingSequencePage;