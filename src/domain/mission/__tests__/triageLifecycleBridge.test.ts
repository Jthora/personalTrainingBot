import { describe, expect, it } from 'vitest';
import { resolveTriageTransition } from '../triageLifecycleBridge';

describe('triageLifecycleBridge', () => {
  describe('Case transitions', () => {
    it('ack: new → assessing', () => {
      const result = resolveTriageTransition('Case', 'new', 'ack');
      expect(result).toEqual({ valid: true, nextStatus: 'assessing', reason: '' });
    });

    it('escalate: new → assessing', () => {
      const result = resolveTriageTransition('Case', 'new', 'escalate');
      expect(result).toEqual({ valid: true, nextStatus: 'assessing', reason: '' });
    });

    it('escalate: assessing → engaged', () => {
      const result = resolveTriageTransition('Case', 'assessing', 'escalate');
      expect(result).toEqual({ valid: true, nextStatus: 'engaged', reason: '' });
    });

    it('resolve: engaged → contained', () => {
      const result = resolveTriageTransition('Case', 'engaged', 'resolve');
      expect(result).toEqual({ valid: true, nextStatus: 'contained', reason: '' });
    });

    it('resolve: contained → closed', () => {
      const result = resolveTriageTransition('Case', 'contained', 'resolve');
      expect(result).toEqual({ valid: true, nextStatus: 'closed', reason: '' });
    });

    it('defer: any non-terminal → closed', () => {
      expect(resolveTriageTransition('Case', 'new', 'defer').valid).toBe(true);
      expect(resolveTriageTransition('Case', 'assessing', 'defer').valid).toBe(true);
      expect(resolveTriageTransition('Case', 'engaged', 'defer').valid).toBe(true);
    });

    it('rejects ack from non-new status', () => {
      const result = resolveTriageTransition('Case', 'engaged', 'ack');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('ack');
    });

    it('rejects resolve from new status', () => {
      const result = resolveTriageTransition('Case', 'new', 'resolve');
      expect(result.valid).toBe(false);
    });

    it('rejects any action on closed case', () => {
      expect(resolveTriageTransition('Case', 'closed', 'ack').valid).toBe(false);
      expect(resolveTriageTransition('Case', 'closed', 'escalate').valid).toBe(false);
      expect(resolveTriageTransition('Case', 'closed', 'resolve').valid).toBe(false);
    });
  });

  describe('Signal transitions', () => {
    it('ack: new → acknowledged', () => {
      const result = resolveTriageTransition('Signal', 'new', 'ack');
      expect(result).toEqual({ valid: true, nextStatus: 'acknowledged', reason: '' });
    });

    it('escalate: acknowledged → investigating', () => {
      const result = resolveTriageTransition('Signal', 'acknowledged', 'escalate');
      expect(result).toEqual({ valid: true, nextStatus: 'investigating', reason: '' });
    });

    it('resolve: investigating → resolved', () => {
      const result = resolveTriageTransition('Signal', 'investigating', 'resolve');
      expect(result).toEqual({ valid: true, nextStatus: 'resolved', reason: '' });
    });

    it('defer dismisses non-terminal signals', () => {
      expect(resolveTriageTransition('Signal', 'new', 'defer').nextStatus).toBe('dismissed');
      expect(resolveTriageTransition('Signal', 'acknowledged', 'defer').nextStatus).toBe('dismissed');
      expect(resolveTriageTransition('Signal', 'investigating', 'defer').nextStatus).toBe('dismissed');
    });

    it('rejects resolve from non-investigating status', () => {
      expect(resolveTriageTransition('Signal', 'new', 'resolve').valid).toBe(false);
      expect(resolveTriageTransition('Signal', 'acknowledged', 'resolve').valid).toBe(false);
    });

    it('rejects actions on terminal statuses', () => {
      expect(resolveTriageTransition('Signal', 'resolved', 'ack').valid).toBe(false);
      expect(resolveTriageTransition('Signal', 'dismissed', 'escalate').valid).toBe(false);
    });
  });

  describe('Unknown lane', () => {
    it('rejects unknown lanes', () => {
      const result = resolveTriageTransition('Unknown' as 'Case', 'new', 'ack');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Unknown');
    });
  });
});
