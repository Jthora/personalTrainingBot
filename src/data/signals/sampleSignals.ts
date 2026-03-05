export type SignalRole = 'ops' | 'intel' | 'medical' | 'training';

export type SignalStatus = 'open' | 'ack' | 'resolved';

export type SignalEntry = {
  id: string;
  title: string;
  detail: string;
  role: SignalRole;
  status: SignalStatus;
  createdAt: number;
  updatedAt: number;
};

const now = Date.now();

export const sampleSignals: SignalEntry[] = [
  {
    id: 'sig-ops-1',
    title: 'Ops: Starter drill ready',
    detail: 'Starter pack cached; announce to team to sync kits before field use.',
    role: 'ops',
    status: 'open',
    createdAt: now - 1000 * 60 * 60 * 6,
    updatedAt: now - 1000 * 60 * 60 * 6,
  },
  {
    id: 'sig-intel-1',
    title: 'Intel: shard refresh queued',
    detail: 'New shard for readiness cues staged; wait for next sync window.',
    role: 'intel',
    status: 'ack',
    createdAt: now - 1000 * 60 * 60 * 12,
    updatedAt: now - 1000 * 60 * 60 * 3,
  },
  {
    id: 'sig-training-1',
    title: 'Training: cooldown copy update',
    detail: 'Cardio cooldown copy needs voice/tone pass; assign to owner.',
    role: 'training',
    status: 'resolved',
    createdAt: now - 1000 * 60 * 60 * 24,
    updatedAt: now - 1000 * 60 * 60 * 2,
  },
];
