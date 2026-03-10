import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './CallsignInput.module.css';

const MAX_LENGTH = 20;

export interface CallsignInputProps {
  /** Current callsign to seed the input. */
  initialValue?: string;
  /** Called with the trimmed callsign when the user commits a change. */
  onSave?: (callsign: string) => void;
  /** If true, auto-focus the input on mount. */
  autoFocus?: boolean;
}

const CallsignInput: React.FC<CallsignInputProps> = ({
  initialValue = '',
  onSave,
  autoFocus = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [showSaved, setShowSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommitted = useRef(initialValue);

  // Keep in sync if parent changes initialValue
  useEffect(() => {
    setValue(initialValue);
    lastCommitted.current = initialValue;
  }, [initialValue]);

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const commit = useCallback(() => {
    const trimmed = value.trim().slice(0, MAX_LENGTH);
    if (trimmed === lastCommitted.current) return;
    lastCommitted.current = trimmed;
    setValue(trimmed);
    onSave?.(trimmed);
    setShowSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setShowSaved(false), 1500);
  }, [value, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  const isOver = value.length > MAX_LENGTH;

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="callsign-input">Callsign</label>
      <div className={styles.inputRow}>
        <input
          id="callsign-input"
          className={styles.input}
          type="text"
          value={value}
          maxLength={MAX_LENGTH + 5} /* soft limit with visual warning */
          placeholder="Enter callsign…"
          autoFocus={autoFocus}
          aria-label="Callsign"
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          data-testid="callsign-input"
        />
        <span className={styles.charCount} data-over={isOver ? 'true' : undefined}>
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
      <span
        className={showSaved ? styles.saved : styles.savedHidden}
        aria-live="polite"
        data-testid="callsign-saved"
      >
        Saved ✓
      </span>
    </div>
  );
};

export default CallsignInput;
