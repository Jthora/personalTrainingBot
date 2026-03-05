import React from 'react';
import { Navigate } from 'react-router-dom';
import { getMissionResumeTarget } from '../../store/missionFlow/continuity';

const MissionEntryRedirect: React.FC = () => {
  const target = getMissionResumeTarget('/mission/brief');
  return <Navigate to={target} replace />;
};

export default MissionEntryRedirect;
