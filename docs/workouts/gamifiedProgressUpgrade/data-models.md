# Data Models

## Progress (UserProgressStore)
- `streakCount: number`
- `lastActiveDate: string` (ISO date, local day boundary handling)
- `xp: number`
- `level: number`
- `badges: BadgeId[]`
- `dailyGoal: { target: number; unit: 'minutes' | 'items'; progress: number; updatedAt: string }`
- `weeklyGoal: { target: number; unit: 'minutes' | 'items'; progress: number; weekStart: string; weekEnd: string }`
- `challenges: ChallengeInstance[]`
- `lastRecap: { date: string; scheduleId?: string; xpEarned: number; badges: BadgeId[] } | null`
- `version: number` (for migrations)
- `quietMode: boolean` (suppress prompts/animations)
- `flags?: { recapEnabled?: boolean; challengesEnabled?: boolean; badgeStripEnabled?: boolean }`

## Derived View-Model (for UI)
- `streakStatus: 'active' | 'frozen' | 'broken'`
- `xpToNextLevel: number`, `levelProgressPercent: number`
- `dailyGoalPercent`, `weeklyGoalPercent`
- `challengeSummaries: { id; title; progress; target; rewardXp; timeframe; timeRemaining }[]`
- `badgesPreview: BadgeId[]` (recent unlocks, truncated)

## Badge Definition
- `id: BadgeId`
- `name: string`
- `description: string`
- `criteria: Criteria` (streak, volume, focus, challenge completion)
- `rewardXp: number`
- `icon: string`
- `category: 'streak' | 'volume' | 'focus' | 'challenge' | 'milestone'`
- `tier?: number` (for progressive badges)

## Challenge Definition/Instance
- `id: string`
- `title: string`
- `description: string`
- `criteria: Criteria`
- `rewardXp: number`
- `timeframe: 'daily' | 'weekly'`
- `startsAt: string`
- `endsAt: string`
- `progress: number`
- `target: number`
- `completed: boolean`
- `claimed: boolean` (reward claimed)
- `hidden?: boolean` (for surprise challenges; default false)

## Schedule Metadata Extensions
- `name: string`
- `date: string`
- `completionPercent: number`
- `estimatedMinutes?: number`
- `difficultyRange?: [number, number]`

## Criteria Examples (shape)
- Streak: `{ type: 'streak', min: N }`
- Volume: `{ type: 'minutes', min: X, timeframe: 'week' | 'day' }`
- Focus: `{ type: 'focus', category: 'cardio' | 'strength' | 'mixed', min: X }`
- Challenge: compound criteria OR timeframe-bounded goals

## Persistence
- LocalStorage key (versioned), safe parse with defaults; migration path per `version`.
- Fallback to in-memory defaults if storage unavailable; suppress reward UI if not persisted.
- Respect `quietMode` in UI surfaces (suppress prompts/animations) without blocking core flows.
