import { describe, expect, it } from 'vitest';
import { filterMissionPaletteActions, type MissionPaletteAction } from '../model';

const actions: MissionPaletteAction[] = [
  { id: 'a1', label: 'Open Mission Brief', keywords: ['brief', 'operation'], path: '/mission/brief' },
  { id: 'a2', label: 'Open Active Case', keywords: ['case', 'investigation'], path: '/mission/case' },
  { id: 'a3', label: 'Open Signal Feed', keywords: ['signal', 'alerts'], path: '/mission/signal' },
];

describe('mission action palette model', () => {
  it('returns all actions for empty query', () => {
    expect(filterMissionPaletteActions(actions, '').length).toBe(3);
  });

  it('filters by label and keyword', () => {
    expect(filterMissionPaletteActions(actions, 'signal').map((item) => item.id)).toEqual(['a3']);
    expect(filterMissionPaletteActions(actions, 'investigation').map((item) => item.id)).toEqual(['a2']);
  });
});
