import styles from './HomePage.module.css';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import CardTable from '../../components/CardTable/CardTable';
import { CardProvider } from '../../context/CardContext';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import { TrainingModule } from '../../types/TrainingModule';

// Mock data for demonstration purposes
const mockTrainingModules: TrainingModule[] = [
    // Add your mock training modules here
];

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCache = async () => {
            const cache = TrainingModuleCache.getInstance();
            if (!cache.isLoaded()) {
                await cache.loadData(mockTrainingModules);
            }
            setIsLoading(false);
        };

        loadCache();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.content}>
                <Sidebar />
                <CardProvider>
                    <CardTable />
                </CardProvider>
            </div>
        </div>
    );
};

export default HomePage;