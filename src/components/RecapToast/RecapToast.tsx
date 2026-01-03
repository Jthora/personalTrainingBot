import React, { useEffect, useState } from 'react';
import styles from './RecapToast.module.css';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { recordMetric } from '../../utils/metrics';
import { logCopyImpression, logCopyInteraction, selectRecapToastCopy } from '../../utils/copy/recapVariants';

const RecapToast: React.FC = () => {
    const { recap, recapToastVisible, openRecap, dismissRecapToast } = useWorkoutSchedule();
    const toastCopy = recap ? selectRecapToastCopy(recap) : null;
    const [visible, setVisible] = useState(false);
    const [impressionLogged, setImpressionLogged] = useState(false);

    useEffect(() => {
        if (recap && recapToastVisible) {
            setVisible(true);
            setImpressionLogged(false);
        } else {
            setVisible(false);
        }
    }, [recap, recapToastVisible]);

    useEffect(() => {
        if (!visible || !recap || !toastCopy) return;
        if (!impressionLogged) {
            recordMetric('recap_toast_impression', { xp: recap.xpDelta ?? recap.xp, streak: recap.streakCount, streakDelta: recap.streakDelta ?? 0, copyVariant: toastCopy.meta.variantId, copyGroup: toastCopy.meta.group });
            logCopyImpression(toastCopy.meta, { xp: recap.xpDelta ?? recap.xp, streak: recap.streakCount });
            setImpressionLogged(true);
        }
        const timer = window.setTimeout(() => {
            setVisible(false);
            dismissRecapToast('timeout');
        }, 5000);
        return () => window.clearTimeout(timer);
    }, [visible, recap, impressionLogged, dismissRecapToast, toastCopy]);

    if (!recap || !visible) return null;

    const streakDelta = recap.streakDelta ?? 0;
    const streakLabel = streakDelta > 0 ? `Streak +${streakDelta}` : `Streak ${recap.streakCount}`;

    const handleDismiss = () => {
        setVisible(false);
        dismissRecapToast('dismiss');
        if (toastCopy) {
            logCopyInteraction(toastCopy.meta, 'dismiss', { reason: 'user' });
        }
    };

    const handleOpenRecap = () => {
        if (toastCopy) {
            logCopyInteraction(toastCopy.meta, 'cta', { xp: recap.xpDelta ?? recap.xp, streakDelta });
        }
        recordMetric('recap_toast_cta', { xp: recap.xpDelta ?? recap.xp, streakDelta, copyVariant: toastCopy?.meta.variantId, copyGroup: toastCopy?.meta.group });
        openRecap();
    };

    return (
        <div className={styles.toast} role="status" aria-live="polite">
            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <div className={styles.title}>{toastCopy?.copy.title ?? 'Schedule complete'}</div>
                    <button aria-label="Dismiss recap toast" className={styles.close} onClick={handleDismiss}>✕</button>
                </div>
                <div className={styles.chips}>
                    <span className={styles.chip}>+{recap.xpDelta ?? recap.xp} XP</span>
                    <span className={styles.chip}>{streakLabel}</span>
                </div>
                <div className={styles.actions}>
                    <button className={styles.cta} onClick={handleOpenRecap}>{toastCopy?.copy.ctaLabel ?? 'View recap'}</button>
                    <button className={styles.secondary} onClick={handleDismiss}>{toastCopy?.copy.dismissLabel ?? 'Dismiss'}</button>
                </div>
            </div>
        </div>
    );
};

export default RecapToast;
