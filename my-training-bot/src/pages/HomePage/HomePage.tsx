import styles from './HomePage.module.css';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import CardTable from '../../components/CardTable/CardTable';
import { CardProvider } from '../../context/CardContext';
import { WorkoutScheduleProvider } from '../../context/WorkoutScheduleContext';
import TrainingModuleCache from '../../cache/TrainingModuleCache';

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCache = async () => {
            const cache = TrainingModuleCache.getInstance();
            if (!cache.isLoaded()) {
                setIsLoading(true);
                await cache.loadData([]); // Ensure the cache is loaded
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };

        loadCache();
    }, []);

    if (isLoading) {
        return <div>HomePage Loading...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.content}>
                <WorkoutScheduleProvider>
                    <Sidebar />
                </WorkoutScheduleProvider>
                <CardProvider>
                    <CardTable />
                </CardProvider>
            </div>
        </div>
    );
};

export default HomePage;