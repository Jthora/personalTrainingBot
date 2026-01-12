import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkoutsWindow.module.css';
import PreviewDrawer from '../PreviewDrawer/PreviewDrawer';
import AlignmentWarning from './AlignmentWarning';
import WorkoutResultsPanel from '../WorkoutResultsPanel/WorkoutResultsPanel';

const WorkoutsWindow: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const openPreview = useCallback(() => setDrawerOpen(true), []);
    const goToDifficultySettings = useCallback(() => navigate('/settings'), [navigate]);

    return (
        <div className={styles.workoutsWindow}>
            <div className={styles.controlsRow}>
                <AlignmentWarning onOpenPreview={openPreview} onAdjustDifficulty={goToDifficultySettings} />
                <button
                    type="button"
                    className={styles.previewToggle}
                    onClick={openPreview}
                    aria-label="Open preview drawer"
                >
                    Preview drawer
                </button>
            </div>
            <WorkoutResultsPanel onOpenPreview={openPreview} />
            <PreviewDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
    );
};

export default WorkoutsWindow;
