import React, { useEffect, useRef, useState } from 'react';
import useWorkoutSchedule from '../../hooks/useWorkoutSchedule';
import { recordMetric } from '../../utils/metrics';
import styles from './RecapModal.module.css';
import { computeBadgeStrip } from '../../utils/badgeStrip';
import { deriveRecapView } from '../../utils/recapCopy';
import { logCopyImpression, logCopyInteraction, selectRecapModalCopy } from '../../utils/copy/recapVariants';

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const RecapModal: React.FC = () => {
    const { recap, recapOpen, dismissRecap } = useWorkoutSchedule();
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [shareStatus, setShareStatus] = useState<string | null>(null);
    const recapCopy = recap ? selectRecapModalCopy(recap) : null;

    useEffect(() => {
    if (!recap || !recapOpen) return;
        recordMetric('recap_modal_open', { level: recap.level, xp: recap.xp, streak: recap.streakCount, copyVariant: recapCopy?.meta.variantId, copyGroup: recapCopy?.meta.group });
        if (recapCopy) {
            logCopyImpression(recapCopy.meta, { level: recap.level, xp: recap.xp, streak: recap.streakCount });
        }
        const modalEl = modalRef.current;
        const focusFirst = () => {
            const first = modalEl?.querySelector<HTMLElement>(focusableSelector);
            first?.focus();
        };
        focusFirst();

        const handleKey = (event: KeyboardEvent) => {
            if (!modalEl) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                dismissRecap();
                recordMetric('recap_modal_dismiss', { reason: 'escape' });
                return;
            }
            if (event.key !== 'Tab') return;
            const focusables = Array.from(modalEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKey, true);
        return () => document.removeEventListener('keydown', handleKey, true);
    }, [recap, dismissRecap, recapCopy]);

    if (!recap || !recapOpen) return null;

    const { visible: visibleBadges, overflow: badgeOverflow } = computeBadgeStrip(recap.badges, {
        totalCount: recap.badgeTotal,
    });
    const recapView = deriveRecapView(recap);
    const headlineCopy = recapCopy?.copy ?? null;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const allowMotion = Boolean(recap.animationsEnabled) && !prefersReducedMotion;
    const backdropClass = allowMotion ? `${styles.backdrop} ${styles.motion}` : styles.backdrop;
    const modalClass = allowMotion ? `${styles.modal} ${styles.modalMotion}` : styles.modal;

    const close = (reason: string) => {
        dismissRecap();
        recordMetric('recap_modal_dismiss', { reason, copyVariant: recapCopy?.meta.variantId, copyGroup: recapCopy?.meta.group });
        if (recapCopy) {
            logCopyInteraction(recapCopy.meta, 'dismiss', { reason });
        }
    };

    const cta = () => {
        recordMetric('recap_modal_cta', { level: recap.level, xp: recap.xp, copyVariant: recapCopy?.meta.variantId, copyGroup: recapCopy?.meta.group });
        if (recapCopy) {
            logCopyInteraction(recapCopy.meta, 'cta', { level: recap.level, xp: recap.xp });
        }
        dismissRecap();
    };

    const copyShareText = async () => {
        if (!recap.shareText) return;
        if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            setShareStatus('Sharing unavailable');
            recordMetric('recap_modal_share_copy', { success: false, reason: 'clipboard-unavailable' });
            return;
        }
        try {
            await navigator.clipboard.writeText(recap.shareText);
            setShareStatus('Copied to clipboard');
            recordMetric('recap_modal_share_copy', { success: true, copyVariant: recapCopy?.meta.variantId, copyGroup: recapCopy?.meta.group });
            if (recapCopy) {
                logCopyInteraction(recapCopy.meta, 'share', { success: true });
            }
        } catch (error) {
            console.warn('RecapModal: failed to copy share text', error);
            setShareStatus('Unable to copy');
            recordMetric('recap_modal_share_copy', { success: false, reason: 'clipboard-error', copyVariant: recapCopy?.meta.variantId, copyGroup: recapCopy?.meta.group });
            if (recapCopy) {
                logCopyInteraction(recapCopy.meta, 'share', { success: false, reason: 'clipboard-error' });
            }
        }
    };

    return (
        <div className={backdropClass} role="presentation">
            <div
                className={modalClass}
                role="dialog"
                aria-modal="true"
                aria-label="Workout recap"
                ref={modalRef}
            >
                <div className={styles.header}>
                    <div>
                        <div className={styles.title}>{headlineCopy?.headerTitle ?? 'Great work!'}</div>
                        <div className={styles.subtitle}>{headlineCopy?.headerSubtitle ?? "You wrapped the plan. Here's your recap."}</div>
                    </div>
                    <button aria-label="Close recap" className={styles.closeButton} onClick={() => close('close-button')}>
                        ×
                    </button>
                </div>

                <div className={styles.highlightCard}>
                    <div className={styles.headline}>{headlineCopy?.headline ?? recapView.headline}</div>
                    <div className={styles.subhead}>{headlineCopy?.subhead ?? recapView.subhead}</div>
                </div>

                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>XP earned</div>
                        <div className={styles.metric}>+{recap.xp} XP</div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Minutes logged</div>
                        <div className={styles.metric}>{recap.minutes} min</div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Level {recap.level}</div>
                        <div className={styles.metric}>{Math.round(recap.levelProgressPercent)}% · {recap.xpToNextLevel} XP to next</div>
                        <div className={styles.progressBar} aria-hidden>
                            <div className={styles.progressFill} style={{ width: `${clampPercent(recap.levelProgressPercent)}%` }} />
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Streak</div>
                        <div className={styles.metric}>{recap.streakCount} days · {recap.streakStatus}</div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Daily goal</div>
                        <div className={styles.metric}>{Math.round(recap.dailyGoalPercent)}%</div>
                        <div className={styles.progressBar} aria-hidden>
                            <div className={styles.progressFill} style={{ width: `${clampPercent(recap.dailyGoalPercent)}%` }} />
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Weekly goal</div>
                        <div className={styles.metric}>{Math.round(recap.weeklyGoalPercent)}%</div>
                        <div className={styles.progressBar} aria-hidden>
                            <div className={styles.progressFill} style={{ width: `${clampPercent(recap.weeklyGoalPercent)}%` }} />
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Badges</div>
                        <div className={styles.badges} aria-label={recap.badges.length ? 'Recently earned badges' : 'No badges yet'}>
                            {visibleBadges.length ? visibleBadges.map((badge) => (
                                <span key={badge}>🏅 {badge}</span>
                            )) : <span>Keep going to earn badges!</span>}
                            {badgeOverflow > 0 && <span className={styles.badgeOverflow}>+{badgeOverflow} more</span>}
                        </div>
                    </div>
                    {(recap.selectionFocus || recap.presetUsed || recap.focusRationale) && (
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Focus</div>
                            {recap.selectionFocus && <div className={styles.metricSmall}>{recap.selectionFocus}</div>}
                            {recap.presetUsed && <div className={styles.meta}>Preset: {recap.presetUsed}</div>}
                            {recap.focusRationale && <p className={styles.rationale}>{recap.focusRationale}</p>}
                        </div>
                    )}
                    {recapView.badgeCelebration && (
                        <div className={`${styles.card} ${allowMotion ? styles.celebration : ''}`}>
                            <div className={styles.cardTitle}>New badges</div>
                            <div className={styles.callouts}>
                                <div className={styles.badgeCelebration}>{recapView.badgeCelebration.text}</div>
                            </div>
                        </div>
                    )}
                    {recapView.challengeCallouts.lines.length > 0 && (
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Challenge progress</div>
                            <div className={styles.callouts}>
                                {recapView.challengeCallouts.lines.map(line => (
                                    <div key={line} className={styles.calloutLine}>{line}</div>
                                ))}
                                {recapView.challengeCallouts.overflow > 0 && (
                                    <div className={styles.meta}>+{recapView.challengeCallouts.overflow} more challenges in progress</div>
                                )}
                            </div>
                        </div>
                    )}
                    {recapView.nextSteps.length > 0 && (
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>Next steps</div>
                            <ul className={styles.nextSteps}>
                                {recapView.nextSteps.map(step => (
                                    <li key={step}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {recap.shareAvailable && recap.shareText && (
                    <div className={styles.shareSection}>
                        <div className={styles.cardTitle}>Share</div>
                        <p className={styles.shareText} aria-label="Shareable recap text">{recap.shareText}</p>
                        <div className={styles.shareActions}>
                            <button className={styles.secondary} onClick={copyShareText}>Copy recap</button>
                            {shareStatus && <span className={styles.shareStatus}>{shareStatus}</span>}
                        </div>
                    </div>
                )}

                {recap.isOffline && !recap.shareAvailable && (
                    <div className={styles.offlineNote}>Offline mode — sharing is disabled until you're back online.</div>
                )}

                <div className={styles.footer}>
                    <button className={styles.secondary} onClick={() => close('dismiss')}>Dismiss</button>
                    <button className={styles.cta} onClick={cta}>Back to planner</button>
                </div>
            </div>
        </div>
    );
};

export default RecapModal;
