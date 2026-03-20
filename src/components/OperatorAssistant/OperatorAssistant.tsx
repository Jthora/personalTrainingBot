/**
 * OperatorAssistant — SOP hint display for the active mission step.
 *
 * Shows SOP prompt (always), plus context/next-action hints in Assist mode.
 * Personalizes hints via archetype if the operative has one configured.
 */
import React from 'react';
import type { GuidanceMode, SopHint } from '../../data/sopHints';
import { getArchetypeHints } from '../../utils/archetypeHints';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import styles from '../../pages/MissionFlow/MissionSurfaces.module.css';

interface OperatorAssistantProps {
  guidanceMode: GuidanceMode;
  hints: SopHint;
  activePath: string;
  isMobile: boolean;
}

const OperatorAssistant: React.FC<OperatorAssistantProps> = ({
  guidanceMode,
  hints,
  activePath,
  isMobile,
}) => {
  const resolveHint = (field: 'contextHint' | 'nextActionHint'): string => {
    const profile = OperativeProfileStore.get();
    if (profile?.archetypeId) {
      const archHint = getArchetypeHints(profile.archetypeId, activePath);
      if (archHint) return archHint[field];
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

export default OperatorAssistant;
