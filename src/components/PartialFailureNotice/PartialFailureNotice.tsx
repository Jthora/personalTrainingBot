import React from 'react';
import styles from './PartialFailureNotice.module.css';

interface PartialFailureNoticeProps {
  messages: string[];
  onDismiss?: () => void;
}

const PartialFailureNotice: React.FC<PartialFailureNoticeProps> = ({ messages, onDismiss }) => {
  if (!messages.length) return null;

  return (
    <div className={styles.notice} role="status" aria-live="polite">
      <div className={styles.header}>
        <span className={styles.title}>Some data used fallbacks</span>
        {onDismiss && (
          <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss fallback notice">
            ×
          </button>
        )}
      </div>
      <ul className={styles.list}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <p className={styles.hint}>Content should still load, but some items may be missing or simplified.</p>
    </div>
  );
};

export default PartialFailureNotice;
