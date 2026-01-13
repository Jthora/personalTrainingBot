import React, { useCallback, useState } from 'react';
import styles from './WorkoutsWindow.module.css';
import PreviewDrawer from '../PreviewDrawer/PreviewDrawer';
import WorkoutResultsPanel from '../WorkoutResultsPanel/WorkoutResultsPanel';

interface WorkoutsWindowProps {
    onOpenFilters?: (target?: 'filters' | 'difficulty') => void;
    filtersOpen?: boolean;
}

const WorkoutsWindow: React.FC<WorkoutsWindowProps> = ({ onOpenFilters, filtersOpen }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const openPreview = useCallback(() => setDrawerOpen(true), []);

    return (
        <div className={styles.workoutsWindow}>
            <WorkoutResultsPanel
                onOpenPreview={openPreview}
                onOpenFilters={onOpenFilters}
                filtersOpen={filtersOpen}
            />
            <PreviewDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
    );
};

export default WorkoutsWindow;
