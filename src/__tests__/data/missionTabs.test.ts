import { describe, it, expect } from 'vitest';
import {
  composeMissionTabs,
  coreTabs,
  statsTab,
  planTab,
  trainingTab,
} from '../../data/missionTabs';

describe('missionTabs', () => {
  it('coreTabs has 6 entries', () => {
    expect(coreTabs).toHaveLength(6);
  });

  it('all core tab paths start with /mission/', () => {
    for (const tab of coreTabs) {
      expect(tab.path).toMatch(/^\/mission\//);
    }
  });

  it('composeMissionTabs includes training at position 2', () => {
    const tabs = composeMissionTabs();
    expect(tabs[0].path).toBe('/mission/brief');
    expect(tabs[1].path).toBe('/mission/training');
  });

  it('composeMissionTabs includes stats and plan by default', () => {
    const tabs = composeMissionTabs();
    const paths = tabs.map((t) => t.path);
    expect(paths).toContain(statsTab.path);
    expect(paths).toContain(planTab.path);
  });

  it('composeMissionTabs excludes stats when disabled', () => {
    const tabs = composeMissionTabs({ stats: false });
    const paths = tabs.map((t) => t.path);
    expect(paths).not.toContain(statsTab.path);
    expect(paths).toContain(planTab.path);
  });

  it('composeMissionTabs excludes plan when disabled', () => {
    const tabs = composeMissionTabs({ plan: false });
    const paths = tabs.map((t) => t.path);
    expect(paths).toContain(statsTab.path);
    expect(paths).not.toContain(planTab.path);
  });

  it('trainingTab has correct path', () => {
    expect(trainingTab.path).toBe('/mission/training');
  });
});
