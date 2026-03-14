/**
 * TrainingSurface — Mission surface for browsing and launching training content.
 *
 * Renders ModuleBrowser (19-domain grid) at the top level, and DeckBrowser
 * (submodule/deck detail) when a module is selected — using simple component
 * state for sub-navigation (no nested routes needed).
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveShellRoute } from '../../utils/resolveShellRoute';
import styles from './MissionFlow.module.css';
import ModuleBrowser from '../../components/ModuleBrowser/ModuleBrowser';
import DeckBrowser from '../../components/DeckBrowser/DeckBrowser';
import CardProgressStore from '../../store/CardProgressStore';

const TrainingSurface: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleModuleSelect = useCallback((moduleId: string) => {
    setSelectedModule(moduleId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedModule(null);
  }, []);

  const handleDrillStarted = useCallback(() => {
    navigate(resolveShellRoute('/mission/checklist'));
  }, [navigate]);

  return (
    <section
      id="section-mission-training"
      className={styles.surface}
      aria-label="Training Content Browser"
    >
      <h2 className={styles.title}>Training</h2>
      <p className={styles.body}>
        Browse 19 operational training modules. Select modules and decks to focus your training,
        then launch drills to build domain competency.
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
        <ModuleBrowser onSelectModule={handleModuleSelect} />
      )}
    </section>
  );
};

export default TrainingSurface;
