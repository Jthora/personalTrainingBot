import React from 'react';
import styles from './WorkoutResultsPanel.module.css';

export type AppliedFiltersBarProps = {
    appliedLabels: string[];
    onClearFilters: () => void;
};

const AppliedFiltersBar: React.FC<AppliedFiltersBarProps> = ({ appliedLabels, onClearFilters }) => {
    if (appliedLabels.length === 0) return null;

    return (
        <div className={styles.appliedBar} aria-label="Applied filters">
            <div className={styles.appliedChips}>
                {appliedLabels.map(label => <span key={label} className={styles.appliedChip}>{label}</span>)}
            </div>
            <button type="button" className={styles.clearButton} onClick={onClearFilters}>
                Clear all
            </button>
        </div>
    );
};

export default AppliedFiltersBar;
