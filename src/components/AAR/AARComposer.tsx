import React, { useEffect, useMemo, useState } from 'react';
import styles from './AARComposer.module.css';
import { AARStore, type AAREntry } from '../../store/AARStore';

const roleLabels = {
  ops: 'Ops',
  intel: 'Intel',
  medical: 'Medical',
  training: 'Training',
};

type RoleKey = keyof typeof roleLabels;

const download = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const AARComposer: React.FC = () => {
  const [entries, setEntries] = useState<AAREntry[]>(AARStore.list());
  const [activeId, setActiveId] = useState<string>(AARStore.list()[0]?.id ?? '');
  const [draft, setDraft] = useState<AAREntry | null>(AARStore.list()[0] ?? null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    return AARStore.subscribe((next) => {
      setEntries(next);
      if (!next.find((e) => e.id === activeId)) {
        setActiveId(next[0]?.id ?? '');
      }
    });
  }, [activeId]);

  useEffect(() => {
    const next = entries.find((e) => e.id === activeId) ?? entries[0] ?? null;
    setDraft(next ? { ...next } : null);
    setDirty(false);
  }, [activeId, entries]);

  useEffect(() => {
    if (!draft || !dirty) return undefined;
    const handle = setTimeout(() => {
      const next = { ...draft, updatedAt: Date.now() } as AAREntry;
      setDraft(next);
      setDirty(false);
      AARStore.save(next);
    }, 800);
    return () => clearTimeout(handle);
  }, [draft, dirty]);

  const save = () => {
    if (!draft) return;
    const sanitized: AAREntry = { ...draft, updatedAt: Date.now() };
    setDraft(sanitized);
    setDirty(false);
    AARStore.save(sanitized);
  };

  const startNew = () => {
    const entry = AARStore.create();
    setActiveId(entry.id);
    setDraft(entry);
    setDirty(false);
  };

  const exportCurrent = () => {
    if (!draft) return;
    const payload = AARStore.exportEntry(draft.id);
    if (!payload) return;
    download(`${draft.title.replace(/\s+/g, '-').toLowerCase() || 'aar'}.json`, payload);
  };

  const setField = (key: keyof AAREntry, value: string) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
    setDirty(true);
  };

  const updatedLabel = useMemo(() => {
    if (!draft) return '';
    return new Date(draft.updatedAt).toLocaleString();
  }, [draft]);

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>After-Action Review</p>
          <h3 className={styles.title}>Capture and export locally</h3>
          {draft ? <p className={styles.meta}>Last updated: {updatedLabel}</p> : null}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={startNew}>New</button>
          <button type="button" className={styles.primary} onClick={save} disabled={!draft}>Save locally</button>
          <button type="button" className={styles.secondary} onClick={exportCurrent} disabled={!draft}>Export JSON</button>
        </div>
      </header>

      <div className={styles.entryPicker}>
        <label className={styles.fieldLabel} htmlFor="aar-entry-select">Saved entries</label>
        <select
          id="aar-entry-select"
          value={activeId}
          onChange={(e) => setActiveId(e.target.value)}
          className={styles.select}
        >
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.title}</option>
          ))}
        </select>
      </div>

      {draft ? (
        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Title</span>
            <input value={draft.title} onChange={(e) => setField('title', e.target.value)} />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Owner</span>
              <input value={draft.owner} onChange={(e) => setField('owner', e.target.value)} placeholder="Owner or callsign" />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Role tag</span>
              <select value={draft.role} onChange={(e) => setField('role', e.target.value as RoleKey)}>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Due date</span>
              <input type="date" value={draft.dueDate ?? ''} onChange={(e) => setField('dueDate', e.target.value)} />
            </label>
          </div>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Context</span>
            <textarea value={draft.context} onChange={(e) => setField('context', e.target.value)} placeholder="Scenario, constraints" />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Actions taken</span>
            <textarea value={draft.actions} onChange={(e) => setField('actions', e.target.value)} placeholder="What you did" />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Outcomes</span>
            <textarea value={draft.outcomes} onChange={(e) => setField('outcomes', e.target.value)} placeholder="Results, metrics" />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Lessons</span>
            <textarea value={draft.lessons} onChange={(e) => setField('lessons', e.target.value)} placeholder="What to keep/change" />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Follow-ups</span>
            <textarea value={draft.followups} onChange={(e) => setField('followups', e.target.value)} placeholder="Owners, dates, dependencies" />
          </label>
        </div>
      ) : (
        <p className={styles.empty}>No AAR entries yet.</p>
      )}
    </div>
  );
};

export default AARComposer;
