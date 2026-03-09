import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MissionEntityStore from '../../domain/mission/MissionEntityStore';
import { useMissionEntityCollection } from '../../hooks/useMissionEntityCollection';
import { readMissionFlowContext } from '../../store/missionFlow/continuity';
import type { ArtifactType, MissionArtifact } from '../../domain/mission/types';
import styles from './ArtifactList.module.css';
import {
  buildArtifactActionLabels,
  buildArtifactDetailFields,
  defaultArtifactFilters,
  filterAndSortArtifacts,
  type ArtifactSortMode,
} from './model';
import { useMissionRenderProbe } from '../../utils/missionRenderProfile';
import { ArtifactActionStore, type ArtifactActionRecord } from '../../store/ArtifactActionStore';

const typeOptions: Array<{ value: ArtifactType | 'all'; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'log', label: 'Log' },
  { value: 'capture', label: 'Capture' },
  { value: 'report', label: 'Report' },
  { value: 'indicator', label: 'Indicator' },
  { value: 'note', label: 'Note' },
];

const sortOptions: Array<{ value: ArtifactSortMode; label: string }> = [
  { value: 'recent', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title (A-Z)' },
];

const resolveCaseArtifacts = (collection: import('../../domain/mission/types').MissionEntityCollection | null): MissionArtifact[] => {
  if (!collection) return [];

  const context = readMissionFlowContext();
  const activeCase = collection.cases.find((item) => item.id === context?.caseId) ?? collection.cases[0];
  if (!activeCase) return [];

  return collection.artifacts.filter((item) => item.caseId === activeCase.id || activeCase.artifactIds.includes(item.id));
};

const ArtifactList: React.FC = () => {
  useMissionRenderProbe('mission:case:artifact-list');
  const collection = useMissionEntityCollection();
  const [query, setQuery] = useState(defaultArtifactFilters.query);
  const [type, setType] = useState<ArtifactType | 'all'>(defaultArtifactFilters.type);
  const [sort, setSort] = useState<ArtifactSortMode>(defaultArtifactFilters.sort);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [artifactActions, setArtifactActions] = useState<Record<string, ArtifactActionRecord>>(() => ArtifactActionStore.getAll());
  const itemButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lastFocusedListId, setLastFocusedListId] = useState<string | null>(null);

  // Subscribe to ArtifactActionStore for persistence across navigation
  useEffect(() => {
    const unsubscribe = ArtifactActionStore.subscribe(setArtifactActions);
    return () => { unsubscribe(); };
  }, []);

  const artifacts = useMemo(() => resolveCaseArtifacts(collection), [collection]);
  const filtered = useMemo(() => filterAndSortArtifacts(artifacts, { query, type, sort }), [artifacts, query, type, sort]);
  const filteredById = useMemo(
    () => new Map(filtered.map((item) => [item.id, item] as const)),
    [filtered],
  );
  const selectedArtifact = useMemo(
    () => (selectedArtifactId ? filteredById.get(selectedArtifactId) ?? null : null) ?? filtered[0] ?? null,
    [filtered, filteredById, selectedArtifactId],
  );

  useEffect(() => {
    if (!selectedArtifactId && filtered[0]) {
      setSelectedArtifactId(filtered[0].id);
      return;
    }
    if (selectedArtifactId && !filtered.some((item) => item.id === selectedArtifactId)) {
      setSelectedArtifactId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedArtifactId]);

  const actionLabels = useMemo(
    () => buildArtifactActionLabels(
      Boolean(selectedArtifact && artifactActions[selectedArtifact.id]?.reviewed),
      Boolean(selectedArtifact && artifactActions[selectedArtifact.id]?.promoted),
    ),
    [artifactActions, selectedArtifact],
  );

  const selectedDetailFields = useMemo(
    () => (selectedArtifact ? buildArtifactDetailFields(selectedArtifact) : []),
    [selectedArtifact],
  );

  const handleCopySource = useCallback(async () => {
    if (!selectedArtifact) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(selectedArtifact.source);
  }, [selectedArtifact]);

  const focusListSelection = useCallback(() => {
    const targetId = lastFocusedListId ?? selectedArtifact?.id ?? null;
    if (!targetId) return;
    itemButtonRefs.current[targetId]?.focus();
  }, [lastFocusedListId, selectedArtifact]);

  const focusDetailPane = useCallback(() => {
    const detailId = selectedArtifact ? `artifact-detail-${selectedArtifact.id}` : null;
    if (!detailId) return;
    const element = document.getElementById(detailId);
    element?.focus();
  }, [selectedArtifact]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === '[') {
      event.preventDefault();
      focusListSelection();
      return;
    }

    if (event.key === ']') {
      event.preventDefault();
      focusDetailPane();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      focusListSelection();
    }
  }, [focusDetailPane, focusListSelection]);

  const handleSelectArtifact = useCallback((artifactId: string) => {
    setSelectedArtifactId(artifactId);
    setLastFocusedListId(artifactId);
  }, []);

  const handleMarkReviewed = useCallback(() => {
    if (!selectedArtifact) return;
    ArtifactActionStore.markReviewed(selectedArtifact.id);
  }, [selectedArtifact]);

  const handlePromoteArtifact = useCallback(() => {
    if (!selectedArtifact) return;
    ArtifactActionStore.markPromoted(selectedArtifact.id);
    // Propagate promotion to canonical entity collection
    MissionEntityStore.getInstance().promoteArtifact(selectedArtifact.id);
  }, [selectedArtifact]);

  return (
    <section className={styles.panel} aria-label="Artifact list" onKeyDown={handleKeyDown}>
      <div className={styles.controls}>
        <input
          className={styles.input}
          type="search"
          placeholder="Search artifacts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search artifacts"
        />

        <select
          className={styles.select}
          value={type}
          onChange={(event) => setType(event.target.value as ArtifactType | 'all')}
          aria-label="Filter artifact type"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={sort}
          onChange={(event) => setSort(event.target.value as ArtifactSortMode)}
          aria-label="Sort artifacts"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No artifacts match the current filters.</p>
      ) : (
        <div className={styles.split}>
          <ul className={styles.list} role="listbox" aria-label="Case artifacts list">
            {filtered.map((artifact) => (
              <li key={artifact.id} className={styles.item} data-selected={selectedArtifact?.id === artifact.id}>
                <button
                  ref={(node) => {
                    itemButtonRefs.current[artifact.id] = node;
                  }}
                  type="button"
                  className={styles.itemButton}
                  onClick={() => handleSelectArtifact(artifact.id)}
                  onFocus={() => setLastFocusedListId(artifact.id)}
                  aria-pressed={selectedArtifact?.id === artifact.id}
                  aria-label={`Open artifact ${artifact.title}`}
                >
                  <p className={styles.title}>{artifact.title}</p>
                  <p className={styles.meta}>
                    {artifact.artifactType.toUpperCase()} · {artifact.source} · {new Date(artifact.collectedAt).toLocaleString()}
                  </p>
                  <p className={styles.desc}>{artifact.description}</p>
                </button>
              </li>
            ))}
          </ul>

          {selectedArtifact ? (
            <article
              id={`artifact-detail-${selectedArtifact.id}`}
              className={styles.detail}
              aria-label="Artifact detail viewer"
              role="group"
              aria-roledescription="detail pane"
              tabIndex={-1}
            >
              <h3 className={styles.detailTitle}>{selectedArtifact.title}</h3>
              <p className={styles.detailDescription}>{selectedArtifact.description}</p>

              <div className={styles.metaGrid}>
                {selectedDetailFields.map((field) => (
                  <div key={field.label} className={styles.metaCell}>
                    <p className={styles.metaLabel}>{field.label}</p>
                    <p className={styles.metaValue}>{field.value}</p>
                  </div>
                ))}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  data-active={Boolean(artifactActions[selectedArtifact.id]?.reviewed)}
                  onClick={handleMarkReviewed}
                  aria-label={`Mark ${selectedArtifact.title} reviewed`}
                >
                  {actionLabels.review}
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  data-active={Boolean(artifactActions[selectedArtifact.id]?.promoted)}
                  onClick={handlePromoteArtifact}
                  aria-label={`Promote ${selectedArtifact.title} to intel`}
                >
                  {actionLabels.promote}
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={handleCopySource}
                  aria-label={`Copy source for ${selectedArtifact.title}`}
                >
                  {actionLabels.copy}
                </button>
              </div>

              <p className={styles.detailHint}>
                Pane shortcuts: <strong>[</strong> focus list, <strong>]</strong> focus details, <strong>Esc</strong> restore list focus.
              </p>
            </article>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default ArtifactList;