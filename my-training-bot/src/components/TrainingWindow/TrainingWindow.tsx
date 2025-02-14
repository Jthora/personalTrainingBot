import React from 'react';
import styles from './TrainingWindow.module.css';
import CoachSelector from '../CoachSelector/CoachSelector';

const TrainingWindow: React.FC = () => {
    return (
        <div className={styles.trainingWindow}>
            <CoachSelector />
        </div>
    );
};

export default TrainingWindow;
