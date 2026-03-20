import { describe, it, expect } from 'vitest';
import { assistantHints, FALLBACK_ROUTE } from '../../data/sopHints';

describe('sopHints', () => {
  it('has hints for all 9 mission routes', () => {
    const routes = [
      '/mission/brief', '/mission/triage', '/mission/case', '/mission/signal',
      '/mission/checklist', '/mission/debrief', '/mission/stats',
      '/mission/plan', '/mission/training',
    ];
    for (const route of routes) {
      const hint = assistantHints[route as keyof typeof assistantHints];
      expect(hint, `missing hint for ${route}`).toBeDefined();
      expect(hint!.sopPrompt).toBeTruthy();
      expect(hint!.contextHint).toBeTruthy();
      expect(hint!.nextActionHint).toBeTruthy();
    }
  });

  it('FALLBACK_ROUTE is /mission/brief', () => {
    expect(FALLBACK_ROUTE).toBe('/mission/brief');
  });

  it('all SOP prompts start with "SOP:"', () => {
    for (const hint of Object.values(assistantHints)) {
      expect(hint!.sopPrompt).toMatch(/^SOP:/);
    }
  });
});
