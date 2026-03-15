/**
 * TrainingSurface — Mission surface for browsing and launching training content.
 *
 * In v2 shell: also renders DrillRunner inline when a drill is active,
 * so users never leave the Train tab during a drill.
 *
 * Renders ModuleBrowser (19-domain grid) at the top level, and DeckBrowser
 * (submodule/deck detail) when a module is selected — using simple component
 * state for sub-navigation (no nested routes needed).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveShellRoute } from '../../utils/resolveShellRoute';
import { isFeatureEnabled } from '../../config/featureFlags';
import { DrillRunStore } from '../../store/DrillRunStore';
import styles from './MissionFlow.module.css';
import ModuleBrowser from '../../components/ModuleBrowser/ModuleBrowser';
import DeckBrowser from '../../components/DeckBrowser/DeckBrowser';
import DrillRunner from '../../components/DrillRunner/DrillRunner';
import CardProgressStore from '../../store/CardProgressStore';

const TrainingSurface: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const isV2 = isFeatureEnabled('shellV2');

  // Track active drill state so we can show DrillRunner inline in v2.
  // Keep DrillRunner mounted while any drill state exists (even completed —
  // DrillRunner handles engagement warning, reflection, and rest interval
  // internally). Only unmount when DrillRunStore.clear() sets state to null.
  const [hasActiveDrill, setHasActiveDrill] = useState(() => {
    const run = DrillRunStore.get();
    return run !== null;
  });

  useEffect(() => {
    if (!isV2) return;
    const unsub = DrillRunStore.subscribe((state) => {
      setHasActiveDrill(state !== null);
    });
    return unsub;
  }, [isV2]);

  const handleModuleSelect = useCallback((moduleId: string) => {
    setSelectedModule(moduleId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedModule(null);
  }, []);

  const handleDrillStarted = useCallback(() => {
    if (isV2) {
      // In v2, DrillRunner renders inline — just trigger state update
      setHasActiveDrill(true);
      setSelectedModule(null);
    } else {
      navigate(resolveShellRoute('/mission/checklist'));
    }
  }, [isV2, navigate]);

  // In v2, if there's an active drill, show DrillRunner inline
  if (isV2 && hasActiveDrill) {
    return (
      <section
        id="section-mission-training"
        className={styles.surface}
        aria-label="Active Drill"
      >
        <DrillRunner />
      </section>
    );
  }

  return (
    <section
      id="section-mission-training"
      className={styles.surface}
      aria-label="Training Content Browser"
    >
      <h2 className={styles.title}>Training</h2>
      <p className={styles.body}>
        Browse training modules below. Pick a module, choose a deck, and start a drill to learn.
      </p>

      {(() => {
        const allDue = CardProgressStore.getCardsDueForReview();
        const total = CardProgressStore.count();
        if (total === 0) return null;
        return (
          <p className={styles.body} data-testid="sr-summary">
            <strong>{allDue.length} cards due for review</strong> · {total} tracked
          </p>
        );
      })()}

      {selectedModule ? (
        <DeckBrowser
          moduleId={selectedModule}
          onBack={handleBack}
          onDrillStarted={handleDrillStarted}
        />
      ) : (
        <ModuleBrowser onSelectModule={handleModuleSelect} onQuickTrain={handleDrillStarted} />
      )}
    </section>
  );
};

export default TrainingSurface;
