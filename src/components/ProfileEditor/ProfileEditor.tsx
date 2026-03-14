import React, { useState, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import styles from './ProfileEditor.module.css';
import CallsignInput from '../CallsignInput/CallsignInput';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import ArchetypePicker from '../ArchetypePicker/ArchetypePicker';
import HandlerPicker from '../HandlerPicker/HandlerPicker';
import type { ArchetypeDefinition } from '../../data/archetypes';
import type { Handler } from '../../data/handlers';
import { findArchetype } from '../../data/archetypes';

type OverlayMode = 'archetype' | 'handler' | null;

const subscribe = (cb: () => void) => OperativeProfileStore.subscribe(cb);
const getSnapshot = () => OperativeProfileStore.getVersion();

const ProfileEditor: React.FC = () => {
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);

  // Re-render when profile changes
  useSyncExternalStore(subscribe, getSnapshot);
  const profile = OperativeProfileStore.get();

  const handleCallsignSave = useCallback((callsign: string) => {
    OperativeProfileStore.patch({ callsign });
  }, []);

  const handleArchetypeSelect = useCallback((archetype: ArchetypeDefinition) => {
    OperativeProfileStore.patch({ archetypeId: archetype.id });
    setOverlayMode(null);
  }, []);

  const handleHandlerSelect = useCallback((handler: Handler) => {
    OperativeProfileStore.patch({ handlerId: handler.id });
    setOverlayMode(null);
  }, []);

  if (!profile) {
    return null; // No profile yet — nothing to edit
  }

  const archetype = findArchetype(profile.archetypeId);

  return (
    <>
      <div className={styles.panel} data-testid="profile-editor">
        <span className={styles.heading}>Edit Profile</span>

        <CallsignInput
          initialValue={profile.callsign}
          onSave={handleCallsignSave}
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setOverlayMode('archetype')}
            data-testid="change-archetype-btn"
          >
            <span className={styles.btnIcon}>{archetype?.icon ?? '🎯'}</span>
            Change Archetype
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setOverlayMode('handler')}
            data-testid="change-handler-btn"
          >
            <span className={styles.btnIcon}>🛡️</span>
            Change Handler
          </button>
        </div>
      </div>

      {overlayMode === 'archetype' && createPortal(
        <div className={styles.overlay} role="dialog" aria-label="Change archetype" data-testid="archetype-overlay">
          <div className={styles.overlayHeader}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOverlayMode(null)}
              data-testid="overlay-close"
            >
              Cancel
            </button>
          </div>
          <ArchetypePicker
            initialArchetypeId={profile.archetypeId}
            onSelect={handleArchetypeSelect}
            onSkip={() => setOverlayMode(null)}
          />
        </div>,
        document.body,
      )}

      {overlayMode === 'handler' && createPortal(
        <div className={styles.overlay} role="dialog" aria-label="Change handler" data-testid="handler-overlay">
          <div className={styles.overlayHeader}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOverlayMode(null)}
              data-testid="overlay-close"
            >
              Cancel
            </button>
          </div>
          <HandlerPicker
            initialHandlerId={profile.handlerId}
            recommendedHandlerId={archetype?.recommendedHandler}
            onSelect={handleHandlerSelect}
            onBack={() => setOverlayMode(null)}
          />
        </div>,
        document.body,
      )}
    </>
  );
};

export default ProfileEditor;
