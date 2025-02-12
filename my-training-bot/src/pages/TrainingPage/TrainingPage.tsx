import styles from './TrainingPage.module.css';
import React from 'react';
import Header from '../../components/Header/Header';
import CardSelector from '../../components/CardSelector/CardSelector';
import TrainingWindow from '../../components/TrainingWindow/TrainingWindow';

const TrainingPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.contentContainer}>
                <div className={styles.cardSelectorContainer}>
                    <CardSelector />
                </div>
                <div className={styles.trainingWindowContainer}>
                    <TrainingWindow />
                </div>
            </div>
        </div>
    );
};

export default TrainingPage;