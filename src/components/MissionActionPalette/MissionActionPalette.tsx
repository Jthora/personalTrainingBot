import React, { useEffect, useMemo, useState } from 'react';
import styles from './MissionActionPalette.module.css';
import { filterMissionPaletteActions, type MissionPaletteAction } from './model';

type Props = {
  actions: MissionPaletteAction[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: MissionPaletteAction) => void;
};

const MissionActionPalette: React.FC<Props> = ({ actions, isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredActions = useMemo(() => filterMissionPaletteActions(actions, query), [actions, query]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Mission action palette"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <input
            className={styles.input}
            type="search"
            autoFocus
            placeholder="Search mission actions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search mission actions"
          />
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close action palette">
            Esc
          </button>
        </div>

        <ul className={styles.list} aria-label="Mission action results">
          {filteredActions.length === 0 ? (
            <li className={styles.empty}>No actions match this query.</li>
          ) : (
            filteredActions.map((action) => (
              <li key={action.id} className={styles.item}>
                <button
                  type="button"
                  className={styles.itemButton}
                  onClick={() => onSelect(action)}
                  aria-label={`Run action ${action.label}`}
                >
                  {action.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

export default MissionActionPalette;
