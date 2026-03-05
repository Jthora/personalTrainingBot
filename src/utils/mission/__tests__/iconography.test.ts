import { describe, expect, it } from 'vitest';
import { missionEntityIcons, missionSeverityIcons } from '../iconography';

describe('mission iconography', () => {
  it('defines icons for all mission entities', () => {
    expect(Object.keys(missionEntityIcons).sort()).toEqual([
      'artifact',
      'case',
      'debrief',
      'intel',
      'lead',
      'operation',
      'signal',
    ]);
  });

  it('defines icons for all severity levels', () => {
    expect(Object.keys(missionSeverityIcons).sort()).toEqual(['critical', 'high', 'low', 'medium']);
  });
});
