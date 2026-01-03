# Feature Pillars

## Progress & Rewards
- Mechanics: streaks (with freeze rules), XP/levels, badges, daily/weekly goals (one each by default), weekly/daily challenges (one each), post-session recap with share.
- Feedback: inline chips, bars, and toasts showing deltas (XP gained, streak change, badge unlocks).
- Fairness: penalties for skips/timeouts balanced with streak protection; XP curve tuned to encourage daily engagement; daily XP/alert ceiling to prevent noise.
- Acceptance: users see immediate streak/XP updates on completion; badges unlock visibly; goal/challenge progress bars advance without reload and without spamming alerts.

## Guided Training Flow
- Today’s plan: recommended set/block aligned to difficulty and selected focus; shows estimated time and intent.
- Smart generation: uses selection + difficulty to assemble balanced schedules (warm-up, main, finisher) with guardrails (no empty schedule).
- Session state: “Now playing” with completion %, next-up view, quick replan/shuffle/replace actions.
- Acceptance: users can generate/start from selection in one step; session state is always visible; replan is one-click and can be cancelled.

## Coaching & Feedback
- Prompts: start, mid-session (rate-limited to max one), completion, streak milestones, off-goal nudges; varied copy to avoid fatigue.
- Alignment nudges: flag out-of-range difficulty items; offer swap or adjust-range actions; only resurface when selection/difficulty materially changes.
- Recap: shows XP/streak/badges/goals/challenges with suggested next steps; primary CTA only.
- Acceptance: prompts fire on events without spamming; alignment warnings offer actionable fixes; recap is reachable and accurate.

## Selection & Schedule UX
- Tools: presets, filters (duration, equipment, focus), search; selection summary with counts + estimated time; difficulty chip.
- Actions: generate/start CTA, preview drawer with reorder/replace, alignment warning badge.
- Clarity: disable/guide when selection is empty; show impact of presets/filters immediately; keep header uncluttered (chips + primary CTA; secondary controls in drawer/more menu).
- Acceptance: a user can pick a preset, see summary update, and create a schedule in one flow; warnings block bad states; header remains concise.

## Home Left-Rail Experience
- Surfaces: actionable “Up Next” stack, progress bars (goal/streak/XP), badge strip (truncated with +N), coach quick actions (regenerate, adjust difficulty, manage selection), “Today’s focus”.
- Interactivity: cards start/resume items; completed view toggle; quick jump to recap.
- Acceptance: left rail shows state at a glance and offers the shortest path to act (start/adjust/share) without overwhelming with widgets.
