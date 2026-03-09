/**
 * Maps triage UI actions to domain lifecycle transitions.
 *
 * Each triage action (ack / escalate / defer / resolve) is resolved
 * to a concrete next-status for the entity's lane (Case or Signal),
 * then validated against the lifecycle state machine.
 */
import type { CaseStatus, SignalStatus } from './types';
import {
  canTransition,
  caseStatusTransitions,
  signalStatusTransitions,
} from './lifecycle';
import type { TriageAction } from '../../components/TriageBoard/model';

export type TriageLane = 'Case' | 'Signal';

export interface TriageTransitionResult {
  valid: boolean;
  /** Domain-level next status (empty string when invalid). */
  nextStatus: string;
  /** Human-readable reason when the transition is blocked. */
  reason: string;
}

/* ── Case action → next status mapping ─────────────────────── */
const caseActionMap: Record<TriageAction, Partial<Record<CaseStatus, CaseStatus>>> = {
  ack:      { new: 'assessing' },
  escalate: { new: 'assessing', assessing: 'engaged' },
  defer:    { new: 'closed', assessing: 'closed', engaged: 'closed', contained: 'closed' },
  resolve:  { engaged: 'contained', contained: 'closed' },
};

/* ── Signal action → next status mapping ───────────────────── */
const signalActionMap: Record<TriageAction, Partial<Record<SignalStatus, SignalStatus>>> = {
  ack:      { new: 'acknowledged' },
  escalate: { new: 'acknowledged', acknowledged: 'investigating' },
  defer:    { new: 'dismissed', acknowledged: 'dismissed', investigating: 'dismissed' },
  resolve:  { investigating: 'resolved' },
};

/**
 * Given a triage lane, the entity's current domain status, and the
 * user's chosen triage action, return the validated next status or
 * a rejection reason.
 */
export function resolveTriageTransition(
  lane: TriageLane,
  currentDomainStatus: string,
  action: TriageAction,
): TriageTransitionResult {
  if (lane === 'Case') {
    const mapping = caseActionMap[action];
    const nextStatus = mapping[currentDomainStatus as CaseStatus];
    if (!nextStatus) {
      return { valid: false, nextStatus: '', reason: `No "${action}" path from case status "${currentDomainStatus}".` };
    }
    if (!canTransition(currentDomainStatus as CaseStatus, nextStatus, caseStatusTransitions)) {
      return { valid: false, nextStatus: '', reason: `Case transition ${currentDomainStatus} → ${nextStatus} is not allowed.` };
    }
    return { valid: true, nextStatus, reason: '' };
  }

  if (lane === 'Signal') {
    const mapping = signalActionMap[action];
    const nextStatus = mapping[currentDomainStatus as SignalStatus];
    if (!nextStatus) {
      return { valid: false, nextStatus: '', reason: `No "${action}" path from signal status "${currentDomainStatus}".` };
    }
    if (!canTransition(currentDomainStatus as SignalStatus, nextStatus, signalStatusTransitions)) {
      return { valid: false, nextStatus: '', reason: `Signal transition ${currentDomainStatus} → ${nextStatus} is not allowed.` };
    }
    return { valid: true, nextStatus, reason: '' };
  }

  return { valid: false, nextStatus: '', reason: `Unknown triage lane "${lane}".` };
}
