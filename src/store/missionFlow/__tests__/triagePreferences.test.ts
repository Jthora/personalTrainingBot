import { beforeEach, describe, expect, it } from 'vitest';
import {
  getDefaultTriagePreferences,
  readTriagePreferences,
  writeTriagePreferences,
} from '../triagePreferences';

describe('triage preferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns defaults when nothing is persisted', () => {
    expect(readTriagePreferences()).toEqual(getDefaultTriagePreferences());
  });

  it('writes and reads updated preferences', () => {
    const saved = writeTriagePreferences({ density: 'compact', view: 'feed' });
    expect(saved).toEqual({ density: 'compact', view: 'feed' });
    expect(readTriagePreferences()).toEqual({ density: 'compact', view: 'feed' });
  });

  it('sanitizes invalid persisted values', () => {
    window.localStorage.setItem('ptb:mission-triage-preferences', JSON.stringify({ density: 'dense', view: 'grid' }));
    expect(readTriagePreferences()).toEqual(getDefaultTriagePreferences());
  });
});