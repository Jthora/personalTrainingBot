export type TriageDensityMode = 'cozy' | 'compact';
export type TriageViewMode = 'columns' | 'feed';

export type TriagePreferences = {
  density: TriageDensityMode;
  view: TriageViewMode;
};

const PREFERENCES_KEY = 'ptb:mission-triage-preferences';

const defaultPreferences: TriagePreferences = {
  density: 'cozy',
  view: 'columns',
};

const safeRead = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore persistence failures
  }
};

const isDensity = (value: unknown): value is TriageDensityMode => value === 'cozy' || value === 'compact';
const isView = (value: unknown): value is TriageViewMode => value === 'columns' || value === 'feed';

export const readTriagePreferences = (): TriagePreferences => {
  const parsed = safeRead<Partial<TriagePreferences>>(PREFERENCES_KEY);
  if (!parsed) return defaultPreferences;

  return {
    density: isDensity(parsed.density) ? parsed.density : defaultPreferences.density,
    view: isView(parsed.view) ? parsed.view : defaultPreferences.view,
  };
};

export const writeTriagePreferences = (next: Partial<TriagePreferences>): TriagePreferences => {
  const merged = {
    ...readTriagePreferences(),
    ...next,
  };

  const sanitized: TriagePreferences = {
    density: isDensity(merged.density) ? merged.density : defaultPreferences.density,
    view: isView(merged.view) ? merged.view : defaultPreferences.view,
  };

  safeWrite(PREFERENCES_KEY, sanitized);
  return sanitized;
};

export const getDefaultTriagePreferences = (): TriagePreferences => defaultPreferences;