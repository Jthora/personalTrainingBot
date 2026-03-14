import type { MissionEntityCollection } from '../../domain/mission/types';

const CONTEXT_KEY = 'ptb:mission-flow-context';
const CHECKPOINT_KEY = 'ptb:mission-flow-checkpoint';
const APP_CHECKPOINT_KEY = 'ptb:app-checkpoint:v1';

const missionRoutePaths = [
  '/mission/brief',
  '/mission/triage',
  '/mission/case',
  '/mission/signal',
  '/mission/checklist',
  '/mission/debrief',
] as const;

const appRoutePaths = [
  '/train',
  '/review',
  '/progress',
  '/profile',
] as const;

export type MissionRoutePath = (typeof missionRoutePaths)[number];

export type MissionFlowContext = {
  operationId: string | null;
  caseId: string | null;
  signalId: string | null;
  updatedAt: number;
};

export type MissionFlowCandidate = {
  operationId?: string | null;
  caseId?: string | null;
  signalId?: string | null;
};

const safeRead = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore persistence failures
  }
};

const idPattern = /^[a-z0-9-]+$/i;

const sanitizeId = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || !idPattern.test(trimmed)) return null;
  return trimmed;
};

const normalizePath = (path: string): MissionRoutePath | null => {
  return (missionRoutePaths as readonly string[]).includes(path) ? (path as MissionRoutePath) : null;
};

const deriveDefaultContext = (collection: MissionEntityCollection | null): MissionFlowContext => {
  const operationId = collection?.operations[0]?.id ?? null;
  const caseId = operationId
    ? collection?.cases.find((item) => item.operationId === operationId)?.id ?? null
    : collection?.cases[0]?.id ?? null;
  const signalId = operationId
    ? collection?.signals.find((item) => item.operationId === operationId)?.id ?? null
    : collection?.signals[0]?.id ?? null;

  return {
    operationId,
    caseId,
    signalId,
    updatedAt: Date.now(),
  };
};

const contextEquals = (a: MissionFlowContext, b: MissionFlowContext): boolean => {
  return a.operationId === b.operationId && a.caseId === b.caseId && a.signalId === b.signalId;
};

export const parseMissionUrlState = (search: string): MissionFlowCandidate => {
  const params = new URLSearchParams(search);
  return {
    operationId: sanitizeId(params.get('op')),
    caseId: sanitizeId(params.get('case')),
    signalId: sanitizeId(params.get('signal')),
  };
};

export const buildMissionUrlState = (context: MissionFlowContext): string => {
  const params = new URLSearchParams();
  if (context.operationId) params.set('op', context.operationId);
  if (context.caseId) params.set('case', context.caseId);
  if (context.signalId) params.set('signal', context.signalId);
  return params.toString();
};

export const resolveMissionFlowContext = (
  collection: MissionEntityCollection | null,
  candidate?: MissionFlowCandidate,
): MissionFlowContext => {
  const defaults = deriveDefaultContext(collection);
  if (!collection) return defaults;

  const operations = collection.operations;
  const selectedOperation = operations.find((item) => item.id === candidate?.operationId) ?? operations[0] ?? null;
  const operationId = selectedOperation?.id ?? null;

  const casePool = operationId
    ? collection.cases.filter((item) => item.operationId === operationId)
    : collection.cases;
  const selectedCase = casePool.find((item) => item.id === candidate?.caseId) ?? casePool[0] ?? null;
  const caseId = selectedCase?.id ?? null;

  const signalPool = operationId
    ? collection.signals.filter((item) => item.operationId === operationId && (!caseId || item.caseId === caseId || !item.caseId))
    : collection.signals;
  const selectedSignal = signalPool.find((item) => item.id === candidate?.signalId) ?? signalPool[0] ?? null;
  const signalId = selectedSignal?.id ?? null;

  return {
    operationId,
    caseId,
    signalId,
    updatedAt: Date.now(),
  };
};

export const readMissionFlowContext = (): MissionFlowContext | null => {
  const parsed = safeRead<MissionFlowContext>(CONTEXT_KEY);
  if (!parsed) return null;
  return {
    operationId: sanitizeId(parsed.operationId),
    caseId: sanitizeId(parsed.caseId),
    signalId: sanitizeId(parsed.signalId),
    updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
  };
};

export const writeMissionFlowContext = (context: MissionFlowContext): MissionFlowContext => {
  const next = {
    operationId: sanitizeId(context.operationId),
    caseId: sanitizeId(context.caseId),
    signalId: sanitizeId(context.signalId),
    updatedAt: Date.now(),
  };
  safeWrite(CONTEXT_KEY, next);
  return next;
};

export const upsertMissionFlowContext = (
  collection: MissionEntityCollection | null,
  candidate?: MissionFlowCandidate,
): { context: MissionFlowContext; changed: boolean } => {
  const existing = readMissionFlowContext();
  const mergedCandidate: MissionFlowCandidate = {
    operationId: candidate?.operationId ?? existing?.operationId,
    caseId: candidate?.caseId ?? existing?.caseId,
    signalId: candidate?.signalId ?? existing?.signalId,
  };
  const resolved = resolveMissionFlowContext(collection, mergedCandidate);
  const changed = !existing || !contextEquals(existing, resolved);
  return { context: writeMissionFlowContext(resolved), changed };
};

export const writeMissionCheckpoint = (path: string): MissionRoutePath | null => {
  const normalized = normalizePath(path);
  if (!normalized) return null;
  safeWrite(CHECKPOINT_KEY, { path: normalized, updatedAt: Date.now() });
  return normalized;
};

export const readMissionCheckpoint = (): { path: MissionRoutePath; updatedAt: number } | null => {
  const parsed = safeRead<{ path: string; updatedAt?: number }>(CHECKPOINT_KEY);
  if (!parsed) return null;
  const path = normalizePath(parsed.path);
  if (!path) return null;
  return { path, updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0 };
};

export const getMissionResumeTarget = (fallback: MissionRoutePath = '/mission/brief'): MissionRoutePath => {
  const checkpoint = readMissionCheckpoint();
  if (!checkpoint) return fallback;
  const dayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - checkpoint.updatedAt > dayMs) return fallback;
  return checkpoint.path;
};

/* ── App shell v2 checkpoint support ── */

type AppRoutePath = (typeof appRoutePaths)[number];

const normalizeAppPath = (path: string): AppRoutePath | null => {
  return (appRoutePaths as readonly string[]).includes(path) ? (path as AppRoutePath) : null;
};

export const writeAppCheckpoint = (path: string): AppRoutePath | null => {
  const normalized = normalizeAppPath(path);
  if (!normalized) return null;
  safeWrite(APP_CHECKPOINT_KEY, { path: normalized, updatedAt: Date.now() });
  return normalized;
};

export const readAppCheckpoint = (): { path: AppRoutePath; updatedAt: number } | null => {
  const parsed = safeRead<{ path: string; updatedAt?: number }>(APP_CHECKPOINT_KEY);
  if (!parsed) return null;
  const path = normalizeAppPath(parsed.path);
  if (!path) return null;
  return { path, updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0 };
};

export const getAppResumeTarget = (fallback: string = '/train'): string => {
  const checkpoint = readAppCheckpoint();
  if (!checkpoint) return fallback;
  const dayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - checkpoint.updatedAt > dayMs) return fallback;
  return checkpoint.path;
};
