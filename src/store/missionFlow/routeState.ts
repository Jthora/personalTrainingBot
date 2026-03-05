import MissionEntityStore from '../../domain/mission/MissionEntityStore';
import { readMissionFlowContext } from './continuity';

export type MissionSurfaceId = 'brief' | 'triage' | 'case' | 'signal' | 'checklist' | 'debrief';

export type MissionSurfaceState =
  | { kind: 'ready' }
  | { kind: 'loading'; title: string; body: string }
  | { kind: 'empty'; title: string; body: string; actionLabel: string; actionPath: string }
  | { kind: 'error'; title: string; body: string; actionLabel: string; actionPath: string };

const exists = (items: Array<{ id: string }>, id: string | null | undefined) => {
  if (!id) return false;
  return items.some((item) => item.id === id);
};

const loadingState: MissionSurfaceState = {
  kind: 'loading',
  title: 'Syncing mission context',
  body: 'Preparing operation, case, and signal continuity for this surface.',
};

export const getMissionSurfaceState = (surface: MissionSurfaceId): MissionSurfaceState => {
  const collection = MissionEntityStore.getInstance().getCanonicalCollection();
  if (!collection) return loadingState;

  const context = readMissionFlowContext();
  const hasOperations = collection.operations.length > 0;
  const hasSignals = collection.signals.length > 0;
  const hasCases = collection.cases.length > 0;

  if (!hasOperations) {
    return {
      kind: 'empty',
      title: 'No active operations',
      body: 'Mission data is unavailable. Sync or load a mission pack, then return to Mission Brief.',
      actionLabel: 'Open Mission Brief',
      actionPath: '/mission/brief',
    };
  }

  if (context?.operationId && !exists(collection.operations, context.operationId)) {
    return {
      kind: 'error',
      title: 'Mission context mismatch',
      body: 'Saved operation no longer exists in current mission data. Reset context and re-enter Mission Brief.',
      actionLabel: 'Reset to Mission Brief',
      actionPath: '/mission/brief',
    };
  }

  if (surface === 'triage' && !hasCases && !hasSignals) {
    return {
      kind: 'empty',
      title: 'No triage items available',
      body: 'No cases or signals are available for triage. Review the brief and sync mission content if needed.',
      actionLabel: 'Open Mission Brief',
      actionPath: '/mission/brief',
    };
  }

  if (surface === 'case' && (!context?.caseId || !exists(collection.cases, context.caseId))) {
    return {
      kind: 'empty',
      title: 'No case selected',
      body: 'Select an active case from Triage Board to continue analysis.',
      actionLabel: 'Open Triage Board',
      actionPath: '/mission/triage',
    };
  }

  if (surface === 'signal' && (!context?.signalId || !exists(collection.signals, context.signalId))) {
    return {
      kind: 'empty',
      title: 'No signal selected',
      body: 'Select an active signal from Triage Board to continue signal analysis.',
      actionLabel: 'Open Triage Board',
      actionPath: '/mission/triage',
    };
  }

  return { kind: 'ready' };
};
