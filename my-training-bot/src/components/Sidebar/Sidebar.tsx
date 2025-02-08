import React, { useEffect, useState } from 'react';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import { TrainingModule } from '../../types/TrainingModule';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);

    useEffect(() => {
        const cache = TrainingModuleCache.getInstance();
        if (cache.isLoaded()) {
            setTrainingModules(Array.from(cache.cache.values()));
        }
    }, []);

    return (
        <aside className={styles.sidebar}>
            {trainingModules.map(module => (
                <button key={module.id} className={styles.moduleButton}>
                    <img src={`/icons/${module.id}.png`} alt={module.name} className={styles.moduleIcon} />
                    <span>{module.name}</span>
                </button>
            ))}
        </aside>
    );
};

export default Sidebar;