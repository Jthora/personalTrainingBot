# Test Fixtures & Seeding

## The Problem

The Academy gates UI behind localStorage keys. A "new user" test must clear all gates; a "returning cadet" test must seed a full profile. Tests that don't control this state will see unpredictable gates.

## localStorage Keys to Manage

| Key | Values | Effect |
|-----|--------|--------|
| `mission:guidance-overlay:v1` | `'seen'` / absent | Controls the welcome overlay |
| `mission:intake:v1` | `'seen'` / absent | Controls the MissionIntakePanel |
| `mission:fast-path:v1` | `'active'` / absent | Fast-path flag for post-drill archetype prompt |
| `mission:step-complete:v1` | JSON map | Which mission steps have been completed this cycle |
| `mission:guidance-mode:v1` | `'seen'` / absent | Guidance mode toggle |
| `operative:profile:v1` | JSON `{ archetypeId, handlerId, callsign, enrolledAt }` | Operative identity |
| `ptb:drill-history:v1` | JSON array | Drill completion records |
| `ptb:drill-stats` | JSON map | Per-drill completion counts |
| `ptb:user-progress:v1` | JSON `{ xp, level, ... }` | XP, level, streaks |
| `ptb:card-progress:v1` | JSON array | Spaced repetition card review history |
| `ptb:mission-flow-context` | JSON `{ operationId, caseId, signalId }` | Active mission context |
| `ptb:mission-kit:v1` | JSON | Today's generated training kit |

## Seed Utility Module

```ts
// e2e/fixtures/seed.ts
import type { Page } from '@playwright/test';

/** Persona presets for seeding localStorage before page load. */
export type Persona =
  | 'brand-new'           // No localStorage at all — sees full onboarding
  | 'fast-path'           // Skipped onboarding, no profile, fast-path flag active
  | 'psi-operative'       // Full profile: Psi Operative + Tara Van Dekar
  | 'cyber-sentinel'      // Full profile: Cyber Sentinel + Agent Simon
  | 'returning-operative' // Has profile + drill history + XP + streaks
  | 'veteran';            // Has profile + hundreds of drills + high level + badges

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
    'ptb:user-progress:v1': JSON.stringify({
      xp: 2350,
      level: 5,
      completedDrills: 47,
      totalMinutes: 1120,
      dailyGoal: 5,
      weeklyGoal: 20,
      dailyProgress: 0,
      weeklyProgress: 0,
      currentStreak: 7,
      longestStreak: 14,
      streakState: 'active',
      lastActiveDate: new Date().toISOString().slice(0, 10),
    }),
  },

  'veteran': {
    'mission:guidance-overlay:v1': 'seen',
    'mission:intake:v1': 'seen',
    'operative:profile:v1': JSON.stringify({
      archetypeId: 'shadow_agent',
      handlerId: 'agent_simon',
      callsign: 'Phantom',
      enrolledAt: '2025-06-01T00:00:00.000Z',
    }),
    'ptb:user-progress:v1': JSON.stringify({
      xp: 15200,
      level: 31,
      completedDrills: 304,
      totalMinutes: 7200,
      dailyGoal: 5,
      weeklyGoal: 20,
      dailyProgress: 3,
      weeklyProgress: 12,
      currentStreak: 30,
      longestStreak: 45,
      streakState: 'active',
      lastActiveDate: new Date().toISOString().slice(0, 10),
    }),
  },
};

/**
 * Seed localStorage for a persona before navigating.
 * Must be called BEFORE page.goto() — uses addInitScript to run
 * in the page context before any app code executes.
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
 * Seed raw key-value pairs into localStorage.
 * For custom scenarios that don't fit a persona preset.
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
export async function readLocalStorage(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => window.localStorage.getItem(k), key);
}

/**
 * Seed mission flow context (operation/case/signal IDs).
 * Matches the pattern used by runPsiOperativeScenario.ts.
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
```

## Usage Pattern

```ts
import { test, expect } from '@playwright/test';
import { seedPersona, readLocalStorage } from '../fixtures/seed';

test('returning operative sees archetype-weighted kit', async ({ page }) => {
  await seedPersona(page, 'psi-operative');
  await page.goto('/mission/brief');

  // TodayLauncher should show archetype name
  await expect(page.getByTestId('today-launch-btn')).toContainText('Psi Operative Training');
});
```

## Mission Context Query String

For tests that need mission context in the URL (matching existing scripts):

```ts
const MISSION_CONTEXT_QUERY = 'op=op-operation-alpha&case=case-alpha-relay-corridor&signal=signal-alpha-beacon-surge';

function withMissionContext(routePath: string): string {
  return routePath.includes('?')
    ? `${routePath}&${MISSION_CONTEXT_QUERY}`
    : `${routePath}?${MISSION_CONTEXT_QUERY}`;
}
```

## Test Data Invariants

These are facts about the production data that tests can rely on:

| Fact | Value | Source |
|------|-------|--------|
| Total training modules | 19 | `training_modules_manifest.json` |
| Total card decks | 663 | Generated shard data |
| Total training cards | ~4,300+ | Generated shard data |
| Archetype count | 8 | `src/data/archetypes.ts` |
| Handler count | 5 | `src/data/handlers.ts` |
| XP per level | 500 | `UserProgressStore.ts` |
| Badge count | 10 | `src/domain/badges.ts` |
| Mission cycle steps | 6 | Brief → Triage → Case → Signal → Checklist → Debrief |
| Psi Operative core modules | psiops, counter_psyops, self_sovereignty, martial_arts | `archetypes.ts` |
| Psi Operative recommended handler | tara_van_dekar | `archetypes.ts` |

## Concrete Card IDs for Seeding

These cards are verified against the production shard data. Every card has `exercises[]` with `expectedOutcome`, `bulletpoints[]`, `learningObjectives[]`, and `keyTerms[]` — guaranteeing all 4 quiz question types can be generated.

```ts
// ── Fitness shard (reliable quiz generation) ──
export const FITNESS_MODULE_ID = 'fitness_training';
export const FITNESS_DECK_ID   = 'olympic_lifting_basics';
export const FITNESS_CARD_IDS  = [
  'snatch_technique',
  'clean_and_jerk',
  'olympic_lifting_basics_fundamentals',
  'olympic_lifting_basics_practical_application',
  'olympic_lifting_basics_advanced_techniques',
] as const;

// ── PsiOps shard (matches Psi Operative archetype) ──
export const PSIOPS_MODULE_ID = 'psiops';
export const PSIOPS_DECK_ID   = 'clairvoyant_perception';
export const PSIOPS_CARD_IDS  = [
  'clairvoyance_1',
  'clairvoyance_2',
  'clairvoyant_perception_fundamentals',
  'clairvoyant_perception_practical_application',
  'clairvoyant_perception_advanced_techniques',
] as const;
```

### Card seeding for due-card scenarios (Story 05)

```ts
/**
 * Seed CardProgressStore with entries that are due for review.
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
    nextReviewAt: yesterday,   // due = nextReviewAt ≤ now
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    lapses: 0,
  }));
  return {
    'ptb:card-progress:v1': JSON.stringify({
      version: 1,
      entries,
    }),
  };
}
```

### Why these specific cards?

The quiz generator has strict requirements per question type:

| Question Type | Required Card Field | Minimum Threshold |
|---|---|---|
| Multiple-choice | `exercises[].expectedOutcome` | Length > 10 chars; ≥ 2 sibling cards for distractors |
| True/false | `bulletpoints[]` | At least one > 8 chars |
| Fill-blank | `learningObjectives[]` | At least one > 20 chars |
| Term-match | `keyTerms[]` + matching `bulletpoints[]` | ≥ 3 matching pairs across cards |

All 10 listed cards meet ALL requirements. Using 5 cards from a single deck guarantees the distractor and pair thresholds are met.
