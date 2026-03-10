import React from 'react';
import styles from './OperativeIdentityCard.module.css';
import OperativeProfileStore from '../../store/OperativeProfileStore';
import { findArchetype } from '../../data/archetypes';
import { handlers as handlerCatalog } from '../../data/handlers';

export interface OperativeIdentityCardProps {
  /** Override profile for testing/preview. Falls back to OperativeProfileStore. */
  archetypeId?: string;
  handlerId?: string;
  callsign?: string;
}

const OperativeIdentityCard: React.FC<OperativeIdentityCardProps> = ({
  archetypeId: overrideArchetype,
  handlerId: overrideHandler,
  callsign: overrideCallsign,
}) => {
  const profile = OperativeProfileStore.get();
  const archetypeId = overrideArchetype ?? profile?.archetypeId;
  const handlerId = overrideHandler ?? profile?.handlerId;
  const callsign = overrideCallsign ?? profile?.callsign;

  const archetype = archetypeId ? findArchetype(archetypeId) : undefined;
  const handler = handlerId ? handlerCatalog.find(h => h.id === handlerId) : undefined;

  if (!archetype && !handler) {
    return (
      <section className={styles.card} aria-label="Operative identity">
        <p className={styles.empty}>No operative profile configured.</p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Operative identity">
      <div className={styles.header}>
        {archetype && <span className={styles.archetypeIcon}>{archetype.icon}</span>}
        <div className={styles.names}>
          {callsign && <h2 className={styles.callsign}>{callsign}</h2>}
          {archetype && <p className={styles.archetype}>{archetype.name}</p>}
        </div>
      </div>

      {archetype && <p className={styles.description}>{archetype.description}</p>}

      {handler && (
        <div className={styles.handlerRow}>
          <img
            src={handler.icon}
            alt={handler.name}
            className={styles.handlerIcon}
            width={32}
            height={32}
          />
          <div className={styles.handlerMeta}>
            <span className={styles.handlerLabel}>Handler</span>
            <span className={styles.handlerName}>{handler.name}</span>
          </div>
        </div>
      )}

      {archetype && (
        <div className={styles.modules}>
          <span className={styles.modulesLabel}>Core Modules</span>
          <div className={styles.modulesTags}>
            {archetype.coreModules.map(m => (
              <span key={m} className={styles.tag}>{m.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default OperativeIdentityCard;
