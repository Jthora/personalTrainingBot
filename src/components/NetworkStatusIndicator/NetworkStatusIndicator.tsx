import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import styles from './NetworkStatusIndicator.module.css';

const NetworkStatusIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();

  return (
    <div
      className={`${styles.indicator} ${isOnline ? styles.online : styles.offline}`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? 'Ready' : 'Offline, using cached intel'}
    </div>
  );
};

export default NetworkStatusIndicator;
