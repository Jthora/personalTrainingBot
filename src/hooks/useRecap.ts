/**
 * useRecap — Manages recap state after schedule completion.
 *
 * Extracted from MissionScheduleContext to isolate recap-building,
 * toast visibility, and share-text logic.
 */
import { useState, useCallback, useRef } from 'react';
import { RecapSummary } from '../types/RecapSummary';
import { MissionSchedule } from '../types/MissionSchedule';
import MissionScheduleStore from '../store/MissionScheduleStore';
import UserProgressStore from '../store/UserProgressStore';
import FeatureFlagsStore from '../store/FeatureFlagsStore';
import { summarizeSchedule } from '../utils/scheduleSummary';
import { buildRecapShareText } from '../utils/recapShareText';
import { recordMetric } from '../utils/metrics';

/** Minimal slice of UserProgress needed for delta computation. */
export interface ProgressSnapshot {
    badges: string[];
    xp: number;
    streakCount: number;
}

export interface CompletionRecapInput {
    /** Result returned by ProgressEventRecorder.recordCompletion(). */
    recapResult: { scheduleEmpty: boolean; xp: number; minutes: number };
    /** UserProgressStore.get() captured *before* the completion was recorded. */
    prevProgress: ProgressSnapshot;
    /** The schedule state *before* completion (used for summary/focus). */
    prevSchedule: MissionSchedule;
}

export function useRecap() {
    const [recap, setRecap] = useState<RecapSummary | null>(null);
    const [recapOpen, setRecapOpen] = useState(false);
    const [recapToastVisible, setRecapToastVisible] = useState(false);
    const promptShownRef = useRef(false);

    /**
     * Evaluate whether a recap should be shown after a schedule completion.
     * Reads latest progress/flags from stores internally — callers only need
     * to supply the pre-completion snapshot and the recorder result.
     */
    const tryBuildRecap = useCallback(({ recapResult, prevProgress, prevSchedule }: CompletionRecapInput) => {
        const flagPrefs = FeatureFlagsStore.get();
        const recapEnabled = flagPrefs.recapEnabled ?? true;
        if (!recapResult.scheduleEmpty || !recapEnabled || flagPrefs.quietMode || promptShownRef.current) return;

        const shareEnabled = flagPrefs.recapShareEnabled ?? true;
        const recapMotionEnabled = flagPrefs.recapAnimationsEnabled ?? true;
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

        const scheduleSummary = summarizeSchedule(prevSchedule);
        const progressPrefs = UserProgressStore.get();
        const latestProgress = UserProgressStore.get();
        const vm = UserProgressStore.getViewModel();

        const unlockedBadges = latestProgress.badges.filter(
            badge => !prevProgress.badges.includes(badge),
        );

        const challengeProgress = (latestProgress.challenges || []).map(ch => ({
            id: ch.id,
            title: ch.title,
            progress: ch.progress,
            target: ch.target,
            timeframe: ch.timeframe,
            rewardXp: ch.rewardXp,
            endsAt: ch.endsAt,
            completed: ch.completed,
            claimed: ch.claimed,
        }));

        const baseRecap: RecapSummary = {
            xp: recapResult.xp,
            minutes: recapResult.minutes,
            streakCount: progressPrefs.streakCount,
            streakStatus: vm.streakStatus,
            xpDelta: Math.max(0, latestProgress.xp - prevProgress.xp),
            streakDelta: Math.max(0, latestProgress.streakCount - prevProgress.streakCount),
            level: progressPrefs.level,
            levelProgressPercent: vm.levelProgressPercent,
            xpToNextLevel: vm.xpToNextLevel,
            dailyGoalPercent: vm.dailyGoalPercent,
            weeklyGoalPercent: vm.weeklyGoalPercent,
            badges: vm.badgesPreview,
            badgeTotal: progressPrefs.badges.length,
            selectionFocus: scheduleSummary?.focus,
            presetUsed: MissionScheduleStore.getLastPreset() ?? 'Custom selection',
            focusRationale: scheduleSummary?.rationale,
            animationsEnabled: recapMotionEnabled,
            isOffline,
            unlockedBadges,
            challengeProgress,
        };

        const share = shareEnabled && !isOffline ? buildRecapShareText(baseRecap) : null;

        setRecap({
            ...baseRecap,
            shareAvailable: Boolean(share?.text),
            shareText: share?.text,
        });
        setRecapToastVisible(true);
        setRecapOpen(false);
        promptShownRef.current = true;
    }, []);

    const openRecap = useCallback(() => {
        if (!recap) return;
        setRecapOpen(true);
        setRecapToastVisible(false);
    }, [recap]);

    const dismissRecap = useCallback(() => {
        setRecap(null);
        setRecapOpen(false);
        setRecapToastVisible(false);
    }, []);

    const dismissRecapToast = useCallback((reason?: string) => {
        setRecapToastVisible(false);
        if (reason) recordMetric('recap_toast_dismiss', { reason });
    }, []);

    return { recap, recapOpen, recapToastVisible, openRecap, dismissRecap, dismissRecapToast, tryBuildRecap };
}
