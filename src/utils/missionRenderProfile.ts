import { useLayoutEffect } from 'react';
import type { ProfilerOnRenderCallback } from 'react';

type RenderPhase = 'mount' | 'update' | 'nested-update';

type RenderAggregate = {
  id: string;
  renderCount: number;
  totalActualDuration: number;
  totalBaseDuration: number;
  maxActualDuration: number;
  lastPhase: RenderPhase;
  lastActualDuration: number;
  lastBaseDuration: number;
};

const ENABLED_KEY = '__MISSION_RENDER_PROFILE_ENABLED__';
const STORE_KEY = '__MISSION_RENDER_PROFILE__';

const getGlobal = (): Record<string, unknown> => globalThis as unknown as Record<string, unknown>;

const isProfilingEnabled = (): boolean => Boolean(getGlobal()[ENABLED_KEY]);

const getStore = (): Record<string, RenderAggregate> => {
  const global = getGlobal();
  const existing = global[STORE_KEY];
  if (existing && typeof existing === 'object') {
    return existing as Record<string, RenderAggregate>;
  }

  const next: Record<string, RenderAggregate> = {};
  global[STORE_KEY] = next;
  return next;
};

const recordRender = (id: string, phase: RenderPhase, actualDuration: number, baseDuration: number): void => {
  const store = getStore();
  const entry = store[id] ?? {
    id,
    renderCount: 0,
    totalActualDuration: 0,
    totalBaseDuration: 0,
    maxActualDuration: 0,
    lastPhase: phase,
    lastActualDuration: 0,
    lastBaseDuration: 0,
  };

  const next: RenderAggregate = {
    ...entry,
    renderCount: entry.renderCount + 1,
    totalActualDuration: entry.totalActualDuration + actualDuration,
    totalBaseDuration: entry.totalBaseDuration + baseDuration,
    maxActualDuration: Math.max(entry.maxActualDuration, actualDuration),
    lastPhase: phase,
    lastActualDuration: actualDuration,
    lastBaseDuration: baseDuration,
  };

  store[id] = next;
};

export const captureMissionRenderProfile: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
) => {
  if (!isProfilingEnabled()) return;
  recordRender(id, phase, actualDuration, baseDuration);
};

export const useMissionRenderProbe = (id: string): void => {
  const renderStartedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

  useLayoutEffect(() => {
    if (!isProfilingEnabled()) return;
    const completedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const duration = Math.max(0, completedAt - renderStartedAt);
    const store = getStore();
    const phase: RenderPhase = store[id] ? 'update' : 'mount';
    recordRender(id, phase, duration, duration);
  });
};

export const resetMissionRenderProfile = (): void => {
  const global = getGlobal();
  global[STORE_KEY] = {};
};
