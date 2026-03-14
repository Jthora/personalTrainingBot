import React from 'react';
import type { MissionRoutePath } from '../../utils/missionTelemetryContracts';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { getArchetypeHints } from '../../utils/archetypeHints';
import styles from '../MissionFlow/MissionFlow.module.css';

type GuidanceMode = 'assist' | 'ops';

interface AssistantCardProps {
  guidanceMode: GuidanceMode;
  activePath: MissionRoutePath;
  hints: { sopPrompt: string; contextHint: string; nextActionHint: string };
  isMobile: boolean;
}

/**
 * Operator assistant guidance card — extracted from MissionShell.
 * Shows SOP prompt + context/next-action hints in Assist mode,
 * or minimal keyboard hint in Ops mode.
 */
const AssistantCard: React.FC<AssistantCardProps> = ({
  guidanceMode,
  activePath,
  hints,
  isMobile,
}) => {
  const resolveHint = (field: 'contextHint' | 'nextActionHint'): string => {
    const profile = OperativeProfileStore.get();
    if (profile?.archetypeId) {
      const archetypeHint = getArchetypeHints(profile.archetypeId, activePath);
      if (archetypeHint) return archetypeHint[field];
    }
    return hints[field];
  };

  return (
    <section className={styles.assistantCard} aria-label="Operator assistant guidance">
      <h2 className={styles.assistantTitle}>
        Operator Assistant · {guidanceMode === 'assist' ? 'Assist Mode' : 'Ops Mode'}
      </h2>
      <p className={styles.assistantHint}>
        <strong>SOP prompt:</strong> {hints.sopPrompt}
      </p>

      {guidanceMode === 'assist' ? (
        <>
          <p className={styles.assistantHint}>
            <strong>Context hint:</strong> {resolveHint('contextHint')}
          </p>
          <p className={styles.assistantHint}>
            <strong>Next action:</strong> {resolveHint('nextActionHint')}
          </p>
          {!isMobile && (
            <p className={styles.assistantHint}>
              <strong>Keyboard:</strong> Use ⌘/Ctrl + K for fast actions, Esc to close overlays.
            </p>
          )}
        </>
      ) : (
        !isMobile && (
          <p className={styles.assistantHint}>
            <strong>Keyboard:</strong> ⌘/Ctrl + K actions · Esc close.
          </p>
        )
      )}
    </section>
  );
};

export default AssistantCard;
