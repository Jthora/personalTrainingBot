import React from 'react';
import styles from './ProgressWidget.module.css';
import UserProgressStore from '../../store/UserProgressStore';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';

const ProgressBar = ({ percent }: { percent: number }) => (
    <div className={styles.barShell}>
        <div className={styles.barFill} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
);

const ProgressWidget: React.FC = () => {
    const progress = UserProgressStore.get();
    if (!UserProgressStore.isStorageAvailable() || UserProgressStore.isDisabled(progress)) return null;
    const vm = UserProgressStore.getViewModel();
    const { schedule } = useWorkoutSchedule();
    const remaining = schedule?.scheduleItems.length ?? 0;
    const level = progress.level;

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <div>
                    <div className={styles.label}>Streak</div>
                    <div className={`${styles.pill} ${styles[vm.streakStatus]}`}>{vm.streakStatus}</div>
                </div>
                <div className={styles.level}>Lv {level}</div>
            </div>
            <div className={styles.row}>
                <div className={styles.label}>Daily goal</div>
                <div className={styles.value}>{Math.round(vm.dailyGoalPercent)}%</div>
            </div>
            <ProgressBar percent={vm.dailyGoalPercent} />
            <div className={styles.row}>
                <div className={styles.label}>Weekly goal</div>
                <div className={styles.value}>{Math.round(vm.weeklyGoalPercent)}%</div>
            </div>
            <ProgressBar percent={vm.weeklyGoalPercent} />
            <div className={styles.footer}>
                <span>XP to next: {vm.xpToNextLevel}</span>
                <span>·</span>
                <span>{remaining} left in schedule</span>
            </div>
        </div>
    );
};

export default ProgressWidget;
