import React from 'react';
import styles from './StatsPanel.module.css';
import UserProgressStore from '../../store/UserProgressStore';

const StatCard = ({ label, value, accent }: { label: string; value: string; accent?: 'primary' | 'warn' }) => (
    <div className={`${styles.card} ${accent === 'warn' ? styles.warn : ''}`}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
    </div>
);

export const StatsPanel: React.FC = () => {
    const progress = UserProgressStore.get();
    if (!UserProgressStore.isStorageAvailable() || UserProgressStore.isDisabled(progress)) return null;
    const vm = UserProgressStore.getViewModel();
    return (
        <div className={styles.panel}>
            <div className={styles.row}>
                <StatCard label="Level" value={`Lv ${progress.level}`} />
                <StatCard label="XP to next" value={`${vm.xpToNextLevel} XP`} />
                <StatCard label="Daily goal" value={`${Math.round(vm.dailyGoalPercent)}%`} />
                <StatCard label="Weekly goal" value={`${Math.round(vm.weeklyGoalPercent)}%`} />
                <StatCard label="Streak" value={vm.streakStatus === 'active' ? 'On' : vm.streakStatus === 'frozen' ? 'Frozen' : 'Reset'} accent={vm.streakStatus === 'broken' ? 'warn' : undefined} />
            </div>
        </div>
    );
};

export default StatsPanel;
