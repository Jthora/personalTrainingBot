import React, { useMemo } from 'react';
import styles from './MissionFlow.module.css';
import statsStyles from './StatsSurface.module.css';
import UserProgressStore from '../../store/UserProgressStore';
import { computeReadiness } from '../../utils/readiness/model';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { MissionKitStore } from '../../store/MissionKitStore';
import { AARStore } from '../../store/AARStore';
import { mapAllAARsToDebriefOutcomes } from '../../utils/readiness/aarBridge';
import OperativeIdentityCard from '../../components/OperativeIdentityCard/OperativeIdentityCard';
import CompetencyChart from '../../components/CompetencyChart/CompetencyChart';
import ScoreLineChart from '../../components/ScoreLineChart/ScoreLineChart';
import { getDisciplineColor } from '../../data/disciplineTheme';
import ActivityHeatmap from '../../components/ActivityHeatmap/ActivityHeatmap';
import ProgressSnapshotStore from '../../store/ProgressSnapshotStore';
import { DOMAIN_CATALOG } from '../../utils/readiness/domainProgress';
import BadgeGallery from '../../components/BadgeGallery/BadgeGallery';
import ChallengeBoard from '../../components/ChallengeBoard/ChallengeBoard';
import ProfileEditor from '../../components/ProfileEditor/ProfileEditor';
import SovereigntyPanel from '../../components/SovereigntyPanel/SovereigntyPanel';
import { isFeatureEnabled } from '../../config/featureFlags';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { findArchetype } from '../../data/archetypes';

const StatsSurface: React.FC = () => {
  const collection = useMissionEntityCollection();
  const exemplarOutcomes = collection?.debriefOutcomes ?? [];
  const aarOutcomes = useMemo(() => mapAllAARsToDebriefOutcomes(AARStore.list()), []);
  const debriefOutcomes = useMemo(() => [...exemplarOutcomes, ...aarOutcomes], [exemplarOutcomes, aarOutcomes]);

  const primaryKit = useMemo(() => MissionKitStore.getPrimaryKit(), []);
  const readiness = useMemo(() => computeReadiness(primaryKit, { debriefOutcomes }), [primaryKit, debriefOutcomes]);

  const progress = UserProgressStore.get();
  const vm = UserProgressStore.getViewModel();

  // Score trend chart data — top 5 active domains
  const chartSeries = useMemo(() => {
    const activeDomains = readiness.domainProgress.domains
      .filter((d) => d.drillCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return activeDomains.map((d) => ({
      domainId: d.domainId,
      domainName: d.domainName,
      color: getDisciplineColor(d.domainId),
      data: ProgressSnapshotStore.getScoreHistory(d.domainId, 30),
    }));
  }, [readiness.domainProgress]);

  return (
    <section id="section-mission-stats" className={styles.surface} aria-label="Operative Dashboard">
      <h2 className={styles.title}>Operative Dashboard</h2>

      {/* Quick stats row */}
      <div className={statsStyles.quickStats}>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>Level</span>
          <span className={statsStyles.statValue}>Lv {progress.level}</span>
        </div>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>XP</span>
          <span className={statsStyles.statValue}>{progress.xp}</span>
        </div>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>XP to Next</span>
          <span className={statsStyles.statValue}>{vm.xpToNextLevel}</span>
        </div>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>Streak</span>
          <span className={statsStyles.statValue} data-status={vm.streakStatus}>
            {vm.streakStatus === 'active' ? `🔥 ${progress.streakCount}d` : vm.streakStatus === 'frozen' ? '❄️ Frozen' : '💀 Reset'}
          </span>
        </div>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>Drills Done</span>
          <span className={statsStyles.statValue}>{progress.totalDrillsCompleted}</span>
        </div>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>Daily Goal</span>
          <span className={statsStyles.statValue}>{Math.round(vm.dailyGoalPercent)}%</span>
        </div>
        <div className={statsStyles.statChip}>
          <span className={statsStyles.statLabel}>Weekly Goal</span>
          <span className={statsStyles.statValue}>{Math.round(vm.weeklyGoalPercent)}%</span>
        </div>
      </div>

      {/* Readiness summary */}
      <div className={statsStyles.readinessRow}>
        <div className={statsStyles.readinessScore}>
          <span className={statsStyles.readinessLabel}>Readiness</span>
          <span className={statsStyles.readinessValue}>{readiness.score}</span>
        </div>
        <div className={statsStyles.readinessMeta}>
          <span>Confidence: {readiness.confidence}</span>
          <span>{readiness.milestone.tier.label}</span>
          <span>Progress: {readiness.milestone.progressPct}%</span>
        </div>
      </div>

      {/* XP progress bar */}
      <div className={statsStyles.xpBar}>
        <div className={statsStyles.xpBarLabel}>Level {progress.level} → {progress.level + 1}</div>
        <div className={statsStyles.xpTrack}>
          <div
            className={statsStyles.xpFill}
            style={{ width: `${vm.levelProgressPercent}%` }}
            role="progressbar"
            aria-valuenow={vm.levelProgressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`XP progress: ${vm.levelProgressPercent}%`}
          />
        </div>
      </div>

      {/* Identity card */}
      <OperativeIdentityCard />

      {/* Profile editor */}
      <ProfileEditor />

      {/* Sovereignty panel — data custody + keypair management */}
      {isFeatureEnabled('p2pIdentity') && <SovereigntyPanel />}

      {/* Score trend chart */}
      <ScoreLineChart series={chartSeries} />

      {/* Activity heatmap */}
      <ActivityHeatmap />

      {/* Domain progress breakdown */}
      <CompetencyChart
        snapshot={readiness.domainProgress}
        activeDomainIds={(() => {
          const profile = OperativeProfileStore.get();
          const arch = profile?.archetypeId ? findArchetype(profile.archetypeId) : undefined;
          return arch ? [...arch.coreModules, ...arch.secondaryModules] : undefined;
        })()}
      />

      {/* Badges */}
      <BadgeGallery />

      {/* Challenges */}
      <ChallengeBoard />
    </section>
  );
};

export default StatsSurface;
