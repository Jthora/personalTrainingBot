import type { Page } from '@playwright/test';

// ── Persona types ─────────────────────────────────────────────────
export type Persona =
  | 'brand-new'
  | 'fast-path'
  | 'psi-operative'
  | 'cyber-sentinel'
  | 'returning-operative'
  | 'veteran'
  | 'grinder';

// ── Concrete card IDs (verified against production shards) ────────
export const FITNESS_MODULE_ID = 'fitness_training';
export const FITNESS_DECK_ID = 'olympic_lifting_basics';
export const FITNESS_CARD_IDS = [
  'snatch_technique',
  'clean_and_jerk',
  'olympic_lifting_basics_fundamentals',
  'olympic_lifting_basics_practical_application',
  'olympic_lifting_basics_advanced_techniques',
] as const;

export const PSIOPS_MODULE_ID = 'psiops';
export const PSIOPS_DECK_ID = 'clairvoyant_perception';
export const PSIOPS_CARD_IDS = [
  'clairvoyance_1',
  'clairvoyance_2',
  'clairvoyant_perception_fundamentals',
  'clairvoyant_perception_practical_application',
  'clairvoyant_perception_advanced_techniques',
] as const;

// ── Today helper ──────────────────────────────────────────────────
// Use LOCAL time (YYYY-MM-DD) to match the app's dayjs().format('YYYY-MM-DD').
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string {
  return localDateStr(new Date());
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

function mondayStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateStr(d);
}

function sundayStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  d.setDate(diff);
  return localDateStr(d);
}

// ── Persona presets ───────────────────────────────────────────────
// Keys must match the actual localStorage keys the app reads.
// STORAGE KEYS:
//   mission:guidance-overlay:v1   — welcome overlay gate
//   mission:intake:v1             — intake panel gate
//   mission:fast-path:v1          — fast-path flag
//   operative:profile:v1          — operative identity
//   userProgress:v1               — XP, level, streaks, badges
//   ptb:card-progress:v1          — spaced repetition card progress
//   ptb:drill-history:v1          — drill completion records
//   ptb:mission-flow-context      — active mission context
//   ptb:mission-kit:v1            — today's training kit

export const PERSONAS: Record<Persona, Record<string, string>> = {
  'brand-new': {},

  'fast-path': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'mission:fast-path:v1': 'active',
  },

  'psi-operative': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'psi_operative',
      handlerId: 'tara_van_dekar',
      callsign: 'Nightshade',
      enrolledAt: '2026-01-15T00:00:00.000Z',
    }),
  },

  'cyber-sentinel': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'cyber_sentinel',
      handlerId: 'agent_simon',
      callsign: 'Wraith',
      enrolledAt: '2026-02-01T00:00:00.000Z',
    }),
  },

  'returning-operative': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'psi_operative',
      handlerId: 'tara_van_dekar',
      callsign: 'Nightshade',
      enrolledAt: '2026-01-15T00:00:00.000Z',
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 7,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 2350,
      level: 5,
      totalDrillsCompleted: 47,
      badges: ['first_drill', 'streak_7'],
      badgeUnlocks: [
        { id: 'first_drill', unlockedAt: '2026-01-16T10:00:00.000Z' },
        { id: 'streak_7', unlockedAt: '2026-01-22T10:00:00.000Z' },
      ],
      dailyGoal: { target: 5, unit: 'ops', progress: 0, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20,
        unit: 'ops',
        progress: 0,
        updatedAt: todayStr(),
        weekStart: mondayStr(),
        weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: false,
    }),
  },

  veteran: {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'shadow_agent',
      handlerId: 'agent_simon',
      callsign: 'Phantom',
      enrolledAt: '2025-06-01T00:00:00.000Z',
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 30,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 15200,
      level: 31,
      totalDrillsCompleted: 304,
      badges: ['first_drill', 'streak_7', 'streak_30'],
      badgeUnlocks: [
        { id: 'first_drill', unlockedAt: '2025-06-02T10:00:00.000Z' },
        { id: 'streak_7', unlockedAt: '2025-06-08T10:00:00.000Z' },
        { id: 'streak_30', unlockedAt: '2025-07-01T10:00:00.000Z' },
      ],
      dailyGoal: { target: 5, unit: 'ops', progress: 3, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20,
        unit: 'ops',
        progress: 12,
        updatedAt: todayStr(),
        weekStart: mondayStr(),
        weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: false,
    }),
  },

  grinder: {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'psi_operative',
      handlerId: 'tara_van_dekar',
      callsign: 'Ironclad',
      enrolledAt: '2026-01-10T00:00:00.000Z',
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 5,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 2350,
      level: 5,
      totalDrillsCompleted: 47,
      badges: ['streak_3', 'streak_7', 'completion_10'],
      badgeUnlocks: [
        { id: 'streak_3', unlockedAt: '2026-01-13T10:00:00.000Z' },
        { id: 'streak_7', unlockedAt: '2026-01-17T10:00:00.000Z' },
        { id: 'completion_10', unlockedAt: '2026-01-20T10:00:00.000Z' },
      ],
      dailyGoal: { target: 5, unit: 'ops', progress: 2, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20,
        unit: 'ops',
        progress: 8,
        updatedAt: todayStr(),
        weekStart: mondayStr(),
        weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: false,
    }),
    'ptb:drill-history:v1': JSON.stringify(
      Array.from({ length: 10 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          id: `drill-hist-${i}`,
          drillId: `drill-${i}`,
          title: `Training session ${i + 1}`,
          elapsedSec: 120 + i * 30,
          stepCount: 4,
          completedAt: d.toISOString(),
          selfAssessment: 3 + (i % 3),
          domainId: 'psiops',
        };
      }),
    ),
  },
};

// ── Seeding utilities ─────────────────────────────────────────────

/**
 * Seed localStorage for a persona before navigating.
 * Must be called BEFORE page.goto() — uses addInitScript to inject
 * into the page context before any app code executes.
 */
export async function seedPersona(page: Page, persona: Persona): Promise<void> {
  const data = PERSONAS[persona];
  await page.addInitScript((entries) => {
    window.localStorage.clear();
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value);
    }
  }, data);
}

/**
 * Seed raw key-value pairs into localStorage (additive — does not clear).
 */
export async function seedLocalStorage(
  page: Page,
  entries: Record<string, string>,
): Promise<void> {
  await page.addInitScript((e) => {
    for (const [key, value] of Object.entries(e)) {
      window.localStorage.setItem(key, value);
    }
  }, entries);
}

/**
 * Read a localStorage value from the running page.
 */
export async function readLocalStorage(
  page: Page,
  key: string,
): Promise<string | null> {
  return page.evaluate((k) => window.localStorage.getItem(k), key);
}

/**
 * Seed mission flow context for Psi Operative scenario.
 */
export async function seedMissionContext(page: Page): Promise<void> {
  await seedLocalStorage(page, {
    'ptb:mission-flow-context': JSON.stringify({
      operationId: 'op-operation-alpha',
      caseId: 'case-alpha-relay-corridor',
      signalId: 'signal-alpha-beacon-surge',
      updatedAt: Date.now(),
    }),
  });
}

/**
 * Build card progress entries that are due for review (for Story 05).
 * Uses real card IDs from the fitness shard.
 */
export function buildDueCardProgressEntries(
  now = Date.now(),
): Record<string, string> {
  const yesterday = new Date(now - 86_400_000).toISOString();
  const entries = FITNESS_CARD_IDS.map((cardId) => ({
    cardId,
    moduleId: FITNESS_MODULE_ID,
    lastReviewedAt: yesterday,
    nextReviewAt: yesterday, // due = nextReviewAt ≤ now
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    lapses: 0,
  }));
  // CardProgressStore validates raw JSON as Array.isArray — store as plain array
  return {
    'ptb:card-progress:v1': JSON.stringify(entries),
  };
}

// ── Mission context query string ──────────────────────────────────
export const MISSION_CONTEXT_QUERY =
  'op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge';

export function withMissionContext(routePath: string): string {
  return routePath.includes('?')
    ? `${routePath}&${MISSION_CONTEXT_QUERY}`
    : `${routePath}?${MISSION_CONTEXT_QUERY}`;
}
