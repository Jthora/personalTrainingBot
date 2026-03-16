import type { Page } from '@playwright/test';

// ── Persona names ─────────────────────────────────────────────────
export type BetaPersona =
  | 'tabula-rasa'
  | 'fast-tracker'
  | 'day-two-cadet'
  | 'active-commander'
  | 'quiz-grinder'
  | 'veteran-operative'
  | 'settings-tweaker'
  | 'empty-cache';

// ── Date helpers (match app's dayjs().format('YYYY-MM-DD')) ───────
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayStr(): string { return localDateStr(new Date()); }
function yesterdayStr(): string {
  const d = new Date(); d.setDate(d.getDate() - 1); return localDateStr(d);
}
function daysAgoStr(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return localDateStr(d);
}
function daysAgoISO(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}
function mondayStr(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return localDateStr(d);
}
function sundayStr(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? 0 : 7));
  return localDateStr(d);
}

// ── Persona data definitions ──────────────────────────────────────
// Keys must match the actual localStorage keys the app reads.

const PERSONA_DATA: Record<BetaPersona, Record<string, string>> = {
  // ── 1. tabula-rasa: Brand-new user, zero state ─────────────────
  'tabula-rasa': {},

  // ── 2. fast-tracker: Skips onboarding via fast-path ─────────────
  'fast-tracker': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'mission:fast-path:v1': 'active',
  },

  // ── 3. day-two-cadet: Completed onboarding + 1 drill yesterday ─
  'day-two-cadet': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'cyber_sentinel',
      handlerId: 'agent_simon',
      callsign: 'Operative-7',
      enrolledAt: daysAgoISO(1),
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 1,
      lastActiveDate: yesterdayStr(),
      streakFrozen: false,
      xp: 40,
      level: 1,
      totalDrillsCompleted: 1,
      badges: [],
      badgeUnlocks: [],
      dailyGoal: { target: 5, unit: 'ops', progress: 0, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20, unit: 'ops', progress: 1,
        updatedAt: todayStr(), weekStart: mondayStr(), weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: false,
    }),
    'ptb:drill-history:v1': JSON.stringify([{
      id: 'drill-cybersec-1:' + new Date(Date.now() - 86_400_000).getTime(),
      drillId: 'drill-cybersec-1',
      title: 'Network Security Basics',
      elapsedSec: 180,
      stepCount: 5,
      completedAt: daysAgoISO(1),
      selfAssessment: 3,
      domainId: 'cybersecurity',
    }]),
  },

  // ── 4. active-commander: Full mission loop user ─────────────────
  'active-commander': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'ptb:mission-mode:v1': 'enabled',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'star_commander',
      handlerId: 'star_commander_raynor',
      callsign: 'Strike-Lead',
      enrolledAt: daysAgoISO(14),
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 7,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 2100,
      level: 5,
      totalDrillsCompleted: 15,
      badges: ['streak_3', 'streak_7', 'completion_10'],
      badgeUnlocks: [
        { id: 'streak_3', unlockedAt: daysAgoISO(11) },
        { id: 'streak_7', unlockedAt: daysAgoISO(7) },
        { id: 'completion_10', unlockedAt: daysAgoISO(4) },
      ],
      dailyGoal: { target: 5, unit: 'ops', progress: 2, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20, unit: 'ops', progress: 10,
        updatedAt: todayStr(), weekStart: mondayStr(), weekEnd: sundayStr(),
      },
      challenges: [{
        id: 'weekly_five_missions',
        title: 'Complete 5 missions this week',
        description: 'Finish 5 full mission briefings',
        rewardXp: 200,
        timeframe: 'weekly',
        startsAt: mondayStr(),
        endsAt: sundayStr(),
        progress: 3,
        target: 5,
        unit: 'missions',
        completed: false,
        claimed: false,
      }],
      lastRecap: null,
      quietMode: false,
    }),
    'ptb:drill-history:v1': JSON.stringify(
      Array.from({ length: 15 }, (_, i) => ({
        id: `drill-cmd-${i}:${Date.now() - i * 86_400_000}`,
        drillId: `drill-cmd-${i}`,
        title: `Mission Drill ${i + 1}`,
        elapsedSec: 120 + i * 20,
        stepCount: 5 + (i % 3),
        completedAt: daysAgoISO(i),
        selfAssessment: 3 + (i % 3),
        domainId: i % 2 === 0 ? 'space_force' : 'war_strategy',
      })),
    ),
    'ptb:signals': JSON.stringify([
      { id: 'sig-ops-1', title: 'Perimeter Alert Alpha', detail: 'Motion detected sector 7', role: 'ops', status: 'open', createdAt: Date.now() - 3_600_000, updatedAt: Date.now() - 3_600_000 },
      { id: 'sig-intel-1', title: 'Intel Brief: Sector 12', detail: 'New frequency detected', role: 'intel', status: 'ack', createdAt: Date.now() - 7_200_000, updatedAt: Date.now() - 5_400_000 },
      { id: 'sig-med-1', title: 'Medical Clearance Report', detail: 'All personnel cleared', role: 'medical', status: 'resolved', createdAt: Date.now() - 86_400_000, updatedAt: Date.now() - 43_200_000 },
    ]),
    'ptb:aar-entries': JSON.stringify([
      { id: 'aar-1', title: 'Operation Nightfall', context: 'Night ops drill', actions: 'Silent approach, breach protocol', outcomes: 'Objective secured', lessons: 'Better comms needed', followups: 'Schedule advanced drill', owner: 'Strike-Lead', role: 'ops', createdAt: Date.now() - 172_800_000, updatedAt: Date.now() - 172_800_000 },
      { id: 'aar-2', title: 'Intel Sweep Charlie', context: 'Signal intercept training', actions: 'Frequency scan, decode, relay', outcomes: 'Partial decode success', lessons: 'Need faster decode tools', followups: 'Request equipment upgrade', owner: 'Strike-Lead', role: 'intel', createdAt: Date.now() - 86_400_000, updatedAt: Date.now() - 86_400_000 },
    ]),
    'ptb:mission-triage-preferences': JSON.stringify({
      density: 'cozy',
      view: 'columns',
    }),
    'ptb:mission-flow-context': JSON.stringify({
      operationId: 'op-operation-alpha',
      caseId: 'case-alpha-relay-corridor',
      signalId: 'signal-alpha-beacon-surge',
      updatedAt: Date.now(),
    }),
  },

  // ── 5. quiz-grinder: Heavy SR review + quiz history ─────────────
  'quiz-grinder': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'shadow_agent',
      handlerId: 'agent_simon',
      callsign: 'Scholar-9',
      enrolledAt: daysAgoISO(21),
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 5,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 1600,
      level: 4,
      totalDrillsCompleted: 32,
      badges: ['streak_3', 'streak_7', 'completion_10'],
      badgeUnlocks: [
        { id: 'streak_3', unlockedAt: daysAgoISO(18) },
        { id: 'streak_7', unlockedAt: daysAgoISO(14) },
        { id: 'completion_10', unlockedAt: daysAgoISO(11) },
      ],
      dailyGoal: { target: 5, unit: 'ops', progress: 1, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20, unit: 'ops', progress: 6,
        updatedAt: todayStr(), weekStart: mondayStr(), weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: false,
    }),
    // 50+ card progress entries spread across 5 modules — all due for review
    'ptb:card-progress:v1': JSON.stringify(
      ['espionage', 'investigation', 'intelligence', 'agencies', 'cybersecurity'].flatMap(
        (moduleId, mi) =>
          Array.from({ length: 10 }, (_, ci) => ({
            cardId: `${moduleId}-card-${ci}`,
            moduleId,
            lastReviewedAt: daysAgoISO(2 + ci),
            nextReviewAt: daysAgoISO(1), // all due (past)
            interval: 1 + ci,
            easeFactor: 2.5 - mi * 0.1,
            repetitions: 1 + ci,
            lapses: ci % 3,
          })),
      ),
    ),
    // 8 quiz sessions
    'ptb:quiz-sessions:v1': JSON.stringify(
      Array.from({ length: 8 }, (_, i) => ({
        id: `qs-${Date.now() - i * 86_400_000}-${Math.random().toString(36).slice(2, 8)}`,
        questions: [],
        answers: [],
        startedAt: daysAgoISO(i),
        completedAt: daysAgoISO(i),
        sourceId: i % 2 === 0 ? 'due-review' : `module-${i}`,
        sourceType: i % 2 === 0 ? 'review' : 'module',
      })),
    ),
  },

  // ── 6. veteran-operative: Maxed-out progression ─────────────────
  'veteran-operative': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'tactical_guardian',
      handlerId: 'tiger_fitness_god',
      callsign: 'Phantom-1',
      enrolledAt: daysAgoISO(60),
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 30,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 4200,
      level: 9,
      totalDrillsCompleted: 105,
      badges: [
        'streak_3', 'streak_7', 'streak_30',
        'completion_10', 'completion_50', 'completion_100',
        'minutes_60', 'minutes_300',
      ],
      badgeUnlocks: [
        { id: 'streak_3', unlockedAt: daysAgoISO(57) },
        { id: 'streak_7', unlockedAt: daysAgoISO(53) },
        { id: 'streak_30', unlockedAt: daysAgoISO(30) },
        { id: 'completion_10', unlockedAt: daysAgoISO(50) },
        { id: 'completion_50', unlockedAt: daysAgoISO(30) },
        { id: 'completion_100', unlockedAt: daysAgoISO(5) },
        { id: 'minutes_60', unlockedAt: daysAgoISO(45) },
        { id: 'minutes_300', unlockedAt: daysAgoISO(20) },
      ],
      dailyGoal: { target: 5, unit: 'ops', progress: 3, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20, unit: 'ops', progress: 15,
        updatedAt: todayStr(), weekStart: mondayStr(), weekEnd: sundayStr(),
      },
      challenges: [
        {
          id: 'weekly_five_missions', title: 'Complete 5 missions this week',
          description: 'Finish 5 full mission briefings', rewardXp: 200,
          timeframe: 'weekly', startsAt: mondayStr(), endsAt: sundayStr(),
          progress: 5, target: 5, unit: 'missions', completed: true, claimed: true,
        },
        {
          id: 'daily_minutes_20', title: 'Train for 20 minutes today',
          description: 'Accumulate 20 minutes of drill time', rewardXp: 50,
          timeframe: 'daily', startsAt: todayStr(), endsAt: todayStr(),
          progress: 12, target: 20, unit: 'minutes', completed: false, claimed: false,
        },
      ],
      lastRecap: null,
      quietMode: false,
    }),
    'ptb:drill-history:v1': JSON.stringify(
      Array.from({ length: 100 }, (_, i) => ({
        id: `drill-vet-${i}:${Date.now() - i * 48_000_000}`,
        drillId: `drill-vet-${i % 20}`,
        title: `Veteran Drill ${i + 1}`,
        elapsedSec: 90 + (i % 10) * 30,
        stepCount: 4 + (i % 4),
        completedAt: new Date(Date.now() - i * 48_000_000).toISOString(),
        selfAssessment: 3 + (i % 3),
        domainId: ['fitness', 'combat', 'martial_arts', 'war_strategy'][i % 4],
      })).slice(0, 100),
    ),
    'ptb:card-progress:v1': JSON.stringify(
      ['fitness', 'combat', 'martial_arts', 'war_strategy'].flatMap(
        (moduleId, mi) =>
          Array.from({ length: 15 }, (_, ci) => ({
            cardId: `${moduleId}-card-${ci}`,
            moduleId,
            lastReviewedAt: daysAgoISO(ci + 1),
            nextReviewAt: ci < 3 ? daysAgoISO(0) : daysAgoStr(-(ci * 2)),
            interval: 2 + ci * 3,
            easeFactor: 2.5 + mi * 0.05,
            repetitions: 3 + ci,
            lapses: ci % 4,
          })),
      ),
    ),
  },

  // ── 7. settings-tweaker: All non-default settings toggled ───────
  'settings-tweaker': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'cosmic_engineer',
      handlerId: 'jono_thora',
      callsign: 'Config-Master',
      enrolledAt: daysAgoISO(7),
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 3,
      lastActiveDate: todayStr(),
      streakFrozen: false,
      xp: 300,
      level: 1,
      totalDrillsCompleted: 6,
      badges: ['streak_3'],
      badgeUnlocks: [{ id: 'streak_3', unlockedAt: daysAgoISO(4) }],
      dailyGoal: { target: 5, unit: 'ops', progress: 0, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20, unit: 'ops', progress: 4,
        updatedAt: todayStr(), weekStart: mondayStr(), weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: true,
    }),
    'ptb:user-preferences': JSON.stringify({
      quietMode: true,
      animationsEnabled: false,
      soundsEnabled: false,
    }),
    'ptb:mission-triage-preferences': JSON.stringify({
      density: 'compact',
      view: 'feed',
    }),
  },

  // ── 8. empty-cache: Full profile but training cache cleared ─────
  'empty-cache': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'field_scholar',
      handlerId: 'tara_van_dekar',
      callsign: 'Cache-Miss',
      enrolledAt: daysAgoISO(5),
    }),
    'userProgress:v1': JSON.stringify({
      version: 1,
      streakCount: 2,
      lastActiveDate: yesterdayStr(),
      streakFrozen: false,
      xp: 100,
      level: 1,
      totalDrillsCompleted: 2,
      badges: [],
      badgeUnlocks: [],
      dailyGoal: { target: 5, unit: 'ops', progress: 0, updatedAt: todayStr() },
      weeklyGoal: {
        target: 20, unit: 'ops', progress: 2,
        updatedAt: todayStr(), weekStart: mondayStr(), weekEnd: sundayStr(),
      },
      challenges: [],
      lastRecap: null,
      quietMode: false,
    }),
    // Intentionally no ptb:card-progress, no training module cache
    // — tests cold-load behavior when modules need fetching from shards
  },
};

// ── Seed function ─────────────────────────────────────────────────

/**
 * Seed localStorage for a beta persona before navigating.
 * Uses addInitScript to inject into the page context before any app code executes.
 *
 * Must be called BEFORE page.goto() — like seedPersona in e2e/fixtures/seed.ts.
 */
export async function seedBetaPersona(page: Page, persona: BetaPersona): Promise<void> {
  const data = PERSONA_DATA[persona];
  await page.addInitScript((entries) => {
    window.localStorage.clear();
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value);
    }
  }, data);
}

/**
 * Seed additional localStorage entries without clearing existing ones.
 */
export async function seedAdditional(
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
export async function readStorage(
  page: Page,
  key: string,
): Promise<string | null> {
  return page.evaluate((k) => window.localStorage.getItem(k), key);
}

// ── Exported data for introspection ───────────────────────────────
export { PERSONA_DATA };
