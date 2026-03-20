import { describe, it, expect } from 'vitest';

import { resolveShellRoute } from '../../utils/resolveShellRoute';

describe('resolveShellRoute', () => {
  it.each([
    ['/mission/checklist', '/train'],
    ['/mission/training', '/train'],
    ['/mission/stats', '/progress'],
    ['/mission/signal', '/review'],
    ['/mission/debrief', '/profile'],
    ['/mission/plan', '/train'],
  ])('maps %s → %s', (input, expected) => {
    expect(resolveShellRoute(input)).toBe(expected);
  });

  it('preserves query strings through mapping', () => {
    expect(resolveShellRoute('/mission/quiz?mode=review')).toBe('/train?mode=review');
  });

  it('passes through unknown paths unchanged', () => {
    expect(resolveShellRoute('/unknown/thing')).toBe('/unknown/thing');
  });
});
