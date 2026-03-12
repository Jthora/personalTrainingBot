import { describe, it, expect } from 'vitest';
import {
  canTransition,
  isValidEntityVersion,
  isIsoDateString,
  operationStatusTransitions,
  caseStatusTransitions,
  leadStatusTransitions,
  signalStatusTransitions,
  intelPacketStatusTransitions,
  DEFAULT_ENTITY_VERSION,
} from '../lifecycle';

describe('lifecycle', () => {
  describe('canTransition', () => {
    it('returns true for valid operation transitions', () => {
      expect(canTransition('planned', 'briefing', operationStatusTransitions)).toBe(true);
      expect(canTransition('briefing', 'triage', operationStatusTransitions)).toBe(true);
      expect(canTransition('active', 'debrief_pending', operationStatusTransitions)).toBe(true);
    });

    it('returns false for invalid transitions', () => {
      expect(canTransition('completed', 'active', operationStatusTransitions)).toBe(false);
      expect(canTransition('planned', 'completed', operationStatusTransitions)).toBe(false);
    });

    it('returns false from terminal states', () => {
      expect(canTransition('archived', 'planned', operationStatusTransitions)).toBe(false);
      expect(canTransition('closed', 'new', caseStatusTransitions)).toBe(false);
      expect(canTransition('resolved', 'new', leadStatusTransitions)).toBe(false);
      expect(canTransition('dismissed', 'new', signalStatusTransitions)).toBe(false);
      expect(canTransition('superseded', 'draft', intelPacketStatusTransitions)).toBe(false);
    });

    it('works across all lifecycle maps', () => {
      expect(canTransition('new', 'assessing', caseStatusTransitions)).toBe(true);
      expect(canTransition('new', 'qualified', leadStatusTransitions)).toBe(true);
      expect(canTransition('acknowledged', 'investigating', signalStatusTransitions)).toBe(true);
      expect(canTransition('draft', 'validated', intelPacketStatusTransitions)).toBe(true);
    });
  });

  describe('isValidEntityVersion', () => {
    it('accepts valid versions', () => {
      expect(isValidEntityVersion('v1')).toBe(true);
      expect(isValidEntityVersion('v42')).toBe(true);
      expect(isValidEntityVersion('v100')).toBe(true);
    });

    it('rejects invalid versions', () => {
      expect(isValidEntityVersion('v')).toBe(false);
      expect(isValidEntityVersion('1')).toBe(false);
      expect(isValidEntityVersion('V1')).toBe(false);
      expect(isValidEntityVersion('v1.0')).toBe(false);
      expect(isValidEntityVersion('')).toBe(false);
    });
  });

  describe('isIsoDateString', () => {
    it('accepts valid ISO 8601 strings', () => {
      expect(isIsoDateString('2024-01-15T10:30:00.000Z')).toBe(true);
    });

    it('rejects invalid/partial dates', () => {
      expect(isIsoDateString('')).toBe(false);
      expect(isIsoDateString('2024-01-15')).toBe(false);
      expect(isIsoDateString('not-a-date')).toBe(false);
    });
  });

  it('DEFAULT_ENTITY_VERSION is v1', () => {
    expect(DEFAULT_ENTITY_VERSION).toBe('v1');
  });
});
