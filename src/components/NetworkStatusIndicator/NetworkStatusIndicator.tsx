import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const baseStyles: React.CSSProperties = {
  position: 'fixed',
  bottom: '12px',
  left: '12px',
  padding: '8px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  backdropFilter: 'blur(6px)',
  zIndex: 1200,
};

const onlineStyles: React.CSSProperties = {
  ...baseStyles,
  background: 'rgba(0, 128, 96, 0.14)',
  color: '#0f5132',
  border: '1px solid rgba(0, 128, 96, 0.35)',
};

const offlineStyles: React.CSSProperties = {
  ...baseStyles,
  background: 'rgba(128, 0, 32, 0.14)',
  color: '#641220',
  border: '1px solid rgba(128, 0, 32, 0.35)',
};

const NetworkStatusIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();

  return (
    <div
      style={isOnline ? onlineStyles : offlineStyles}
      role="status"
      aria-live="polite"
    >
      {isOnline ? 'Ready' : 'Offline, using cached intel'}
    </div>
  );
};

export default NetworkStatusIndicator;
