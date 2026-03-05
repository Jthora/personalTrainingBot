import React, { useEffect, useMemo, useState } from 'react';
import styles from './SignalsPanel.module.css';
import { SignalsStore } from '../../store/SignalsStore';
import type { SignalEntry, SignalRole } from '../../data/signals/sampleSignals';

const roleLabels: Record<SignalRole, string> = {
  ops: 'Ops',
  intel: 'Intel',
  medical: 'Medical',
  training: 'Training',
};

const roleColors: Record<SignalRole, string> = {
  ops: '#6EE7B7',
  intel: '#93C5FD',
  medical: '#FCD34D',
  training: '#FCA5A5',
};

const roleOptions: SignalRole[] = ['ops', 'intel', 'medical', 'training'];

const formatTime = (ts: number) => new Date(ts).toLocaleString();

const SignalsPanel: React.FC = () => {
  const [signals, setSignals] = useState<SignalEntry[]>(() => SignalsStore.list());
  const [queueLength, setQueueLength] = useState<number>(SignalsStore.queueLength());
  const [filter, setFilter] = useState<'all' | SignalRole>('all');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [role, setRole] = useState<SignalRole>('ops');

  useEffect(() => {
    return SignalsStore.subscribe((next, queue) => {
      setSignals(next);
      setQueueLength(queue);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return signals;
    return signals.filter((s) => s.role === filter);
  }, [filter, signals]);

  const addSignal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !detail.trim()) return;
    SignalsStore.add(title.trim(), detail.trim(), role);
    setTitle('');
    setDetail('');
  };

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>Signals</p>
          <h3 className={styles.title}>Signal Operations Brief</h3>
        </div>
        <div className={styles.meta}>
          {queueLength > 0 ? `Sync required: ${queueLength} queued` : 'Ready'}
        </div>
      </header>

      <form className={styles.form} onSubmit={addSignal} aria-label="Create signal report">
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Signal title" required />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Role tag</span>
            <select value={role} onChange={(e) => setRole(e.target.value as SignalRole)}>
              {roleOptions.map((opt) => (
                <option key={opt} value={opt}>{roleLabels[opt]}</option>
              ))}
            </select>
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Details</span>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="What changed, who needs to know" required />
        </label>
        <button type="submit" className={styles.primary}>Add signal</button>
      </form>

      <div className={styles.filterRow}>
        <span className={styles.fieldLabel}>Filter</span>
        <div className={styles.filterButtons} role="group" aria-label="Filter by role">
          <button type="button" className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>
            All
          </button>
          {roleOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.filterButton} ${filter === opt ? styles.filterActive : ''}`}
              onClick={() => setFilter(opt)}
              aria-pressed={filter === opt}
            >
              {roleLabels[opt]}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.list}>
        {filtered.map((signal) => (
          <li key={signal.id} className={styles.item}>
            <div className={styles.itemHead}>
              <div>
                <p className={styles.itemTitle}>{signal.title}</p>
                <p className={styles.itemMeta}>
                  <span className={styles.roleBadge} style={{ backgroundColor: roleColors[signal.role] }}>
                    {roleLabels[signal.role]}
                  </span>
                  <span className={styles.status}>{signal.status.toUpperCase()}</span>
                  <span className={styles.timestamp}>Updated {formatTime(signal.updatedAt)}</span>
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => SignalsStore.acknowledge(signal.id)}
                  disabled={signal.status === 'ack' || signal.status === 'resolved'}
                >
                  Acknowledge
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => SignalsStore.resolve(signal.id)}
                  disabled={signal.status === 'resolved'}
                >
                  Resolve
                </button>
              </div>
            </div>
            <p className={styles.itemBody}>{signal.detail}</p>
          </li>
        ))}
        {filtered.length === 0 ? <li className={styles.empty}>No signals match the current filter. Adjust or clear the filter to continue.</li> : null}
      </ul>
    </div>
  );
};

export default SignalsPanel;
