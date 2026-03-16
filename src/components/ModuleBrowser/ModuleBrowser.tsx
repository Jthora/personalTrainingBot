/**
 * ModuleBrowser — Grid of 19 training module tiles.
 *
 * Shows each domain's name, card/deck counts (from TrainingModuleCache),
 * domain score (from domainProgress), and a selection checkbox.
 * Clicking a tile navigates to the deck detail view for that module.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import CardProgressStore from '../../store/CardProgressStore';
import UserProgressStore from '../../store/UserProgressStore';
import { DrillRunStore } from '../../store/DrillRunStore';
import { buildDrillStepsFromModule } from '../../utils/drillStepBuilder';
import { findArchetype } from '../../data/archetypes';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { DOMAIN_CATALOG, deriveDomainSnapshot } from '../../utils/readiness/domainProgress';
import type { DomainProgress } from '../../utils/readiness/domainProgress';
import Sparkline from '../Sparkline/Sparkline';
import { getDiscipline, getDisciplineColor } from '../../data/disciplineTheme';
import ProgressSnapshotStore from '../../store/ProgressSnapshotStore';
import styles from './ModuleBrowser.module.css';

export interface ModuleBrowserProps {
  /** Called when user clicks a module tile to drill into its decks. */
  onSelectModule: (moduleId: string) => void;
  /** Called when a Quick Train action starts a drill directly. */
  onQuickTrain?: () => void;
}

const ModuleBrowser: React.FC<ModuleBrowserProps> = ({ onSelectModule, onQuickTrain }) => {
  const cache = TrainingModuleCache.getInstance();
  const snapshot = deriveDomainSnapshot();
  const domainMap = new Map(snapshot.domains.map((d) => [d.domainId, d]));
  const isFirstTime = UserProgressStore.get().totalDrillsCompleted === 0;

  // Selection state — subscribe to changes so checkbox toggles re-render
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = cache.subscribeToSelectionChanges(() => setTick((t) => t + 1));
    return unsub;
  }, [cache]);

  // Subscribe to operative profile changes
  const [profile, setProfile] = useState(OperativeProfileStore.get());
  useEffect(() => {
    const unsub = OperativeProfileStore.subscribe(() => setProfile(OperativeProfileStore.get()));
    return unsub;
  }, []);

  // Partition modules: core → secondary → other based on archetype
  const { orderedDomains, coreSet, secondarySet } = useMemo(() => {
    const archetype = profile?.archetypeId ? findArchetype(profile.archetypeId) : null;
    const core = new Set(archetype?.coreModules ?? []);
    const secondary = new Set(archetype?.secondaryModules ?? []);

    const coreList = DOMAIN_CATALOG.filter((d) => core.has(d.id));
    const secondaryList = DOMAIN_CATALOG.filter((d) => secondary.has(d.id));
    const otherList = DOMAIN_CATALOG.filter((d) => !core.has(d.id) && !secondary.has(d.id));

    return {
      orderedDomains: [...coreList, ...secondaryList, ...otherList],
      coreSet: core,
      secondarySet: secondary,
    };
  }, [profile]);

  const handleToggleModule = useCallback(
    (e: React.MouseEvent, moduleId: string) => {
      e.stopPropagation();
      cache.toggleModuleSelection(moduleId);
    },
    [cache],
  );

  const handleQuickTrain = useCallback(
    (e: React.MouseEvent, moduleId: string, moduleName: string) => {
      e.stopPropagation();
      const steps = buildDrillStepsFromModule(moduleId, 10);
      if (steps.length === 0) return;
      DrillRunStore.start(`module-${moduleId}`, moduleName, steps);
      onQuickTrain?.();
    },
    [onQuickTrain],
  );

  if (!cache.isLoaded()) {
    return <div className={styles.empty}>Loading training modules…</div>;
  }

  return (
    <div className={styles.browser} data-testid="module-browser">
      {isFirstTime && (
        <div className={styles.welcomeBanner} data-testid="welcome-banner">
          <h3 className={styles.welcomeHeading}>Welcome to Starcom Academy</h3>
          <p className={styles.welcomeBody}>
            Pick any module below to start your first drill. Each module covers a different discipline
            — from cybersecurity to fitness to martial arts.
            {coreSet.size > 0 && ' Your core modules are highlighted.'}
          </p>
        </div>
      )}
      <div className={styles.grid}>
        {orderedDomains.map((domain) => {
          const stats = cache.getModuleStats(domain.id);
          const progress: DomainProgress | undefined = domainMap.get(domain.id);
          const score = progress?.score ?? 0;
          const isSelected = cache.isModuleSelected(domain.id);
          const sr = CardProgressStore.getModuleReviewStats(domain.id);
          const isCore = coreSet.has(domain.id);
          const disc = getDiscipline(domain.id);
          const isSecondary = secondarySet.has(domain.id);

          const tileClass = [
            styles.tile,
            isCore ? styles.tileCore : '',
            isSecondary ? styles.tileSecondary : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={domain.id}
              className={tileClass}
              data-testid={`module-tile-${domain.id}`}
              onClick={() => onSelectModule(domain.id)}
              style={{ borderLeftColor: disc.color, background: disc.bgTint }}
            >
              <div className={styles.tileHeader}>
                <button
                  type="button"
                  className={styles.moduleName}
                  onClick={(e) => { e.stopPropagation(); onSelectModule(domain.id); }}
                >
                  <span className={styles.disciplineIcon}>{disc.icon}</span>
                  {domain.name}
                  {isCore && <span className={styles.focusBadge}>Core</span>}
                  {isSecondary && <span className={styles.secondaryBadge}>Focus</span>}
                </button>
                <span
                  className={styles.selectionToggle}
                  onClick={(e) => handleToggleModule(e, domain.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {/* handled by parent onClick */}}
                    aria-label={`Select ${domain.name}`}
                    tabIndex={-1}
                  />
                </span>
              </div>

              <div className={styles.tileStats}>
                <span className={styles.stat}>{stats.totalCards} cards</span>
                <span className={styles.stat}>{stats.totalDecks} decks</span>
                {progress && progress.drillCount > 0 && (
                  <span className={styles.stat}>{progress.drillCount} drills</span>
                )}
              </div>

              {sr.total > 0 && (
                <div className={styles.tileStats} data-testid={`sr-stats-${domain.id}`}>
                  {sr.due > 0 && <span className={styles.stat}>{sr.due} due</span>}
                  <span className={styles.stat}>{sr.learning} learning</span>
                  <span className={styles.stat}>{sr.mature} mature</span>
                </div>
              )}

              <div className={styles.scoreRow}>
                <div className={styles.scoreBar}>
                  <div className={styles.scoreFill} style={{ width: `${score}%`, background: disc.color }} />
                </div>
                <Sparkline
                  data={ProgressSnapshotStore.getScoreHistory(domain.id, 7)}
                  width={48}
                  height={16}
                  color={getDisciplineColor(domain.id)}
                />
              </div>

              {progress && progress.coverageRatio !== null && (
                <span className={styles.selectedCount}>
                  {Math.round(progress.coverageRatio * 100)}% coverage
                </span>
              )}

              <button
                type="button"
                className={styles.quickTrainBtn}
                onClick={(e) => handleQuickTrain(e, domain.id, domain.name)}
                data-testid={`quick-train-${domain.id}`}
              >
                ▶ Quick Train
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleBrowser;
