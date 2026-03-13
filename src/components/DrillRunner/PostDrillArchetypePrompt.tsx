import React from 'react';
import styles from './PostDrillArchetypePrompt.module.css';
import ArchetypePicker from '../ArchetypePicker/ArchetypePicker';
import type { ArchetypeDefinition } from '../../data/archetypes';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import { trackEvent } from '../../utils/telemetry';

export type PostDrillArchetypePromptProps = {
  onComplete: () => void;
};

/**
 * 5.4.1.4 — After a fast-path user completes their first drill, prompt them
 * to pick an archetype so future kits are weighted to their preference.
 */
const PostDrillArchetypePrompt: React.FC<PostDrillArchetypePromptProps> = ({ onComplete }) => {
  const handleSelect = (archetype: ArchetypeDefinition) => {
    OperativeProfileStore.set({
      archetypeId: archetype.id,
      handlerId: archetype.recommendedHandler,
      callsign: '',
      enrolledAt: new Date().toISOString(),
    });

    // Auto-select archetype's core + secondary modules
    const cache = TrainingModuleCache.getInstance();
    if (cache.isLoaded()) {
      cache.selectModules([...archetype.coreModules, ...archetype.secondaryModules]);
    }

    // Clear fast-path flag
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('mission:fast-path:v1');
    }

    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: '/mission/training',
      data: {
        kind: 'post_drill_archetype_selected',
        archetypeId: archetype.id,
      },
      source: 'ui',
    });

    onComplete();
  };

  const handleSkip = () => {
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: '/mission/training',
      data: { kind: 'post_drill_archetype_skipped' },
      source: 'ui',
    });
    onComplete();
  };

  return (
    <div className={styles.prompt} data-testid="post-drill-archetype-prompt">
      <p className={styles.heading}>Nice work on your first drill!</p>
      <p className={styles.body}>
        Pick an archetype to focus your training on the skills that matter most to you.
      </p>
      <ArchetypePicker onSelect={handleSelect} onSkip={handleSkip} />
    </div>
  );
};

export default PostDrillArchetypePrompt;
