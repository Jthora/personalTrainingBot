import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MissionKitStore } from '../../store/MissionKitStore';
import { DrillRunStore } from '../../store/DrillRunStore';
import CardProgressStore from '../../store/CardProgressStore';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { findArchetype } from '../../data/archetypes';
import { trackEvent } from '../../utils/telemetry';
import { resolveShellRoute } from '../../utils/resolveShellRoute';
import styles from './TodayLauncher.module.css';

/**
 * TodayLauncher — prominent CTA that launches today's training session with one tap.
 * Generates a kit (if needed), finds the first incomplete drill, and starts it.
 */
const TodayLauncher: React.FC = () => {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);

  const kit = useMemo(() => MissionKitStore.getPrimaryKit(), []);

  const drills = kit?.drills ?? [];
  const completedDrillIds = useMemo(() => {
    const stats: Record<string, { completionCount: number }> = {};
    try {
      const raw = localStorage.getItem('ptb:drill-stats');
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, { completionCount?: number }>;
        for (const [id, entry] of Object.entries(parsed)) {
          if (entry?.completionCount && entry.completionCount > 0) {
            stats[id] = { completionCount: entry.completionCount };
          }
        }
      }
    } catch { /* ignore */ }
    return new Set(Object.keys(stats));
  }, []);

  const incompleteDrills = drills.filter((d) => !completedDrillIds.has(d.id));
  const allComplete = drills.length > 0 && incompleteDrills.length === 0;
  const nextDrill = incompleteDrills[0];

  // Count SR-due cards for review quiz button
  const dueCount = useMemo(() => CardProgressStore.getCardsDueForReview().length, []);

  // 5.4.3.2: Resolve archetype for CTA personalization (reactive to profile changes)
  const [profileVersion, setProfileVersion] = useState(0);
  useEffect(() => {
    return OperativeProfileStore.subscribe(() => setProfileVersion((v) => v + 1));
  }, []);
  const archetype = useMemo(() => {
    const profile = OperativeProfileStore.get();
    return profile?.archetypeId ? findArchetype(profile.archetypeId) : undefined;
  }, [profileVersion]);

  // Derive module names for summary
  const moduleNames = useMemo(() => {
    const names = new Set<string>();
    for (const drill of drills) {
      const moduleId = (drill as { moduleId?: string }).moduleId;
      if (moduleId) {
        // Capitalize and format the module ID
        const formatted = moduleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        names.add(formatted);
      }
    }
    return Array.from(names);
  }, [drills]);

  const handleLaunch = () => {
    if (!nextDrill || launching) return;
    setLaunching(true);
    const steps = nextDrill.steps?.length
      ? nextDrill.steps
      : [{ id: `${nextDrill.id}-execute`, label: nextDrill.title }];
    DrillRunStore.start(nextDrill.id, nextDrill.title, steps);
    trackEvent({
      category: 'training',
      action: 'today_launcher_start',
      data: { drillId: nextDrill.id, remainingDrills: incompleteDrills.length },
      source: 'ui',
    });
    navigate(resolveShellRoute('/mission/checklist'));
  };

  const handleRegenerate = () => {
    MissionKitStore.regenerateKit();
    // Force re-render by reloading the page context
    window.location.reload();
  };

  if (!kit || drills.length === 0) {
    return (
      <div className={styles.launcher} data-testid="today-launcher">
        <p className={styles.emptyMessage}>
          No training session yet. Browse modules in the <strong>Training</strong> tab to start your first drill.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.launcher} data-testid="today-launcher">
      {allComplete ? (
        <>
          <div className={styles.completeMessage}>
            <span className={styles.completeIcon}>✅</span>
            <span>Session complete! All {drills.length} drills finished.</span>
          </div>
          <button
            type="button"
            className={styles.regenerateBtn}
            onClick={handleRegenerate}
            data-testid="regenerate-btn"
          >
            Generate New Session
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={styles.launchBtn}
            onClick={handleLaunch}
            disabled={launching}
            data-testid="today-launch-btn"
          >
            {launching ? 'Launching…' : archetype ? `${archetype.icon} ${archetype.name} Exercises` : "Start Today's Training"}
          </button>
          {dueCount > 0 && (
            <button
              type="button"
              className={styles.reviewBtn}
              onClick={() => navigate(resolveShellRoute('/mission/quiz?mode=review'))}
              data-testid="review-quiz-btn"
            >
              Review {dueCount} Due Card{dueCount !== 1 ? 's' : ''}
            </button>
          )}
          <p className={styles.summary}>
            {incompleteDrills.length} of {drills.length} drill{drills.length !== 1 ? 's' : ''} remaining
            {archetype && (
              <span className={styles.modules} data-testid="archetype-kit-label"> · {archetype.name} curriculum</span>
            )}
            {moduleNames.length > 0 && (
              <span className={styles.modules}> · {moduleNames.slice(0, 3).join(', ')}{moduleNames.length > 3 ? ` +${moduleNames.length - 3} more` : ''}</span>
            )}
          </p>
        </>
      )}
    </div>
  );
};

export default TodayLauncher;
