import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkoutsWindow.module.css';
import WorkoutSelector from '../WorkoutSelector/WorkoutSelector';
import PreviewDrawer from '../PreviewDrawer/PreviewDrawer';
import AlignmentWarning from './AlignmentWarning';

const WorkoutsWindow: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const openPreview = useCallback(() => setDrawerOpen(true), []);
    const goToDifficultySettings = useCallback(() => navigate('/settings'), [navigate]);

    return (
        <div className={styles.workoutsWindow}>
            <div className={styles.controlsRow}>
                <AlignmentWarning onOpenPreview={openPreview} onAdjustDifficulty={goToDifficultySettings} />
                <button className={styles.previewToggle} onClick={openPreview}>
                    Preview drawer
                </button>
            </div>
            <WorkoutSelector />
            <PreviewDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
    );
};

export default WorkoutsWindow;
