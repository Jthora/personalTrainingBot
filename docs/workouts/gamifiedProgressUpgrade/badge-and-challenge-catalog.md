# Badge & Challenge Catalog

## Badge Categories
- Streak: 3/7/14/30-day, with progressive tiers.
- Volume: minutes completed (50, 150, 300, 600+), items completed (10, 30, 75).
- Focus: cardio specialist, strength block finisher, upper/lower split completions, mixed endurance.
- Challenge: granted for completing weekly/daily challenges.
- Milestone: first session, first week with 3 sessions, first 1000 XP, first badge streak.
- Keep catalog lean: prefer 8–12 total in first release; avoid overwhelming users.

## Badge Definition Template
- `id`, `name`, `description`, `criteria`, `rewardXp`, `icon`, `category`, optional `tier` and `hidden` (for surprises).
- Consider `rarity` for visual treatment only; no gameplay advantage.

## Sample Badges
- "First Session": complete 1 workout; +50 XP; category: milestone.
- "Consistency 7": maintain 7-day streak; +150 XP; streak category.
- "Consistency 30": maintain 30-day streak; +400 XP; streak category, tiered.
- "Endurance 60": complete 60+ minutes in a week; +100 XP; volume.
- "Volume 300": complete 300 minutes in a week; +250 XP; volume, tiered.
- "Cardio Sprint": finish 3 cardio blocks in a week; +120 XP; focus.
- "Strength Stack": complete 3 strength sets in a day; +120 XP; focus.
- "Challenge Crusher": complete a weekly challenge; +200 XP; challenge.
- Avoid stacking too many similar volume tiers in v1; ship 1–2 per category first.

## Challenge Templates (Weekly/Daily)
- Weekly: "Complete 3 sessions" (target=3 sessions, reward=200 XP).
- Weekly: "Total 90 minutes" (target=90 minutes, reward=200 XP).
- Weekly: "Complete 2 cardio blocks" (target=2 blocks, reward=180 XP).
- Daily: "Do a finisher block" (target=1 block, reward=80 XP).
- Daily: "Hit 20 minutes" (target=20 minutes, reward=70 XP).
- Daily: "Upper/Lower focus" (complete 1 upper or lower strength set, reward=80 XP).
- Keep only one daily and one weekly active; rotate with variety but not complexity.

## Rotation & Stacking Rules
- One active weekly challenge; reset on week start (store start/end). Old progress archived/ignored.
- One active daily challenge; rotates every day at local midnight; if incomplete, marked expired.
- Badges unlock permanently; challenges grant XP and may unlock a badge (e.g., "Challenge Crusher").
- Prevent double-claim: challenge has `completed` and `claimed` flags; grant XP once.
- Do not overlap multiple challenges of the same type; avoid multi-target stacking.

## Rewards & Display
- Rewards: XP (initially); potential cosmetic flair later.
- Display: badges in CoachDialog strip and on `WorkoutCard`; challenge progress in sidebar; unlocked badges highlighted in recap.
- Celebration: confetti/animation optional and behind a toggle/flag.
- Strip truncation: show up to 3 recent badges, then “+N”; challenges show succinct progress only.
