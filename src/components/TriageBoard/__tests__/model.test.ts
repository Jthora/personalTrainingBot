import { describe, expect, it } from 'vitest';
import { applyTriageAction, resolveShortcutAction, type TriageCard } from '../model';

const baseCard: TriageCard = {
  id: 'case-1',
  title: 'Case One',
  body: 'Summary',
  lane: 'Case',
  severity: 'medium',
  status: 'NEW',
};

describe('triage board interaction model', () => {
  it('maps keyboard shortcuts to triage actions', () => {
    expect(resolveShortcutAction('a')).toBe('ack');
    expect(resolveShortcutAction('E')).toBe('escalate');
    expect(resolveShortcutAction('d')).toBe('defer');
    expect(resolveShortcutAction('r')).toBe('resolve');
    expect(resolveShortcutAction('x')).toBeNull();
  });

  it('escalates severity and updates status', () => {
    const escalated = applyTriageAction(baseCard, 'escalate');
    expect(escalated.severity).toBe('high');
    expect(escalated.status).toBe('ESCALATED');
  });

  it('caps escalation at critical severity', () => {
    const criticalCard: TriageCard = { ...baseCard, severity: 'critical' };
    const escalated = applyTriageAction(criticalCard, 'escalate');
    expect(escalated.severity).toBe('critical');
    expect(escalated.status).toBe('ESCALATED');
  });

  it('applies ack defer and resolve status labels', () => {
    expect(applyTriageAction(baseCard, 'ack').status).toBe('ACKNOWLEDGED');
    expect(applyTriageAction(baseCard, 'defer').status).toBe('DEFERRED');
    expect(applyTriageAction(baseCard, 'resolve').status).toBe('RESOLVED');
  });
});
