# Scheduling and Deferral Plan

1. Goals
- Define what loads pre-render vs post-first-paint vs on interaction.
- Use prioritization (immediate/high/idle) with guardrails.
- Avoid main-thread jank; keep within phase budgets.

2. Phases
- Pre-render: minimal shell assets, router, theme, critical data fetch kicks off.
- Post-first-paint (critical): data needed to fill skeletons (coach/module metadata, schedule stub, categories).
- Enrichment: workout details, avatars, sounds, analytics.
- Idle: cache warm, prefetch next routes/chunks, cleanup.
- Interaction-triggered: feature-specific assets on demand (share, scheduler, training window deep content).

3. Priority Queue Concept
- High priority: shell render, critical data fetches.
- Medium: enrichment assets for current route.
- Low/idle: prefetch next-route assets, cache warm.
- Implement with simple scheduler that respects `navigator.connection.effectiveType` and CPU estimate.

4. requestIdleCallback Usage
- Use for low-priority prefetch/warm tasks.
- Guard: fallback to `setTimeout` if unavailable; cap idle tasks to <=50ms chunks.
- Cancel idle tasks on navigation/focus change to avoid wasted work.

5. Avoiding Main-thread Jank
- Keep synchronous work before first paint under ~50ms.
- Split large JSON parsing using `await` + yielding to event loop if needed.
- Avoid heavy sync loops; chunk work across frames.

6. Max Budget per Phase (targets)
- Pre-render sync: <50ms.
- Critical phase (until shell + minimal data ready): <1500ms mid-tier 4G.
- Enrichment: <800ms blocking; remainder async/idle.
- Idle tasks: should not block input; each task <50ms.

7. Pre-render Loads
- App shell JS (core + vendor split), theme CSS, fonts preload, router setup.
- Kick off critical data fetches immediately after boot mark.

8. Post-first-paint Loads
- Apply settings/preferences.
- Consume coach/module metadata and schedule stub to populate skeleton labels.
- Minimal images (tiny avatars) only if cheap; otherwise defer.

9. Enrichment Loads
- Workout details for visible list portion.
- Avatars medium-res; sounds metadata.
- Analytics init (if enabled) after critical ready.
- TrainingWindow chunk only when entering training flow.

10. Interaction-triggered Loads
- Scheduler chunk + calendar libs when opening scheduler.
- ShareCard chunk when user clicks share.
- Audio binaries when user starts training with sound on.

11. Idle Tasks
- Prefetch next likely route chunks (hover/intent-based).
- Warm caches: fetch additional workout details for soon-needed items.
- Clean stale cache entries.
- Prefetch images for recommended coaches/workouts.

12. Guardrails
- Network-aware: skip prefetch on `2g` or `saveData`.
- CPU-aware: limit concurrent parsing on low-end devices.
- Cancel/skip idle tasks if tab hidden.

13. Telemetry
- Mark when each phase begins/ends.
- Log duration of idle tasks and whether canceled.
- Track deferral success: percent of enrichment done post-paint.

14. UX States
- Show shell skeleton immediately.
- Replace skeletons incrementally as data arrives.
- For idle warm tasks, optionally show subtle indicator or keep silent to avoid noise.

15. Testing
- Simulate throttled networks to ensure deferral rules hold.
- Verify `saveData` honored.
- Ensure no blocking spinners appear after initial paint.

16. Rollout
- Implement scheduler helper; wire tasks with priorities.
- Expose debug overlay to see scheduled/idle tasks.
- Gradually move tasks from critical to deferred categories.

17. Risks
- Over-deferral causing late content: mitigate by monitoring enrichment completion times.
- Under-deferral causing jank: monitor main-thread long tasks.

18. Acceptance Criteria
- Pre-render and critical phases within budgets on device matrix.
- No main-thread long tasks >200ms during boot.
- Idle/preload work respects network/CPU guardrails.

19. Implementation Notes
- Simple queue with priority levels; tasks carry `canRunOnSaveData`, `requiresOnline`, `maxDurationMs` hints.
- Use `AbortController` to cancel deferred tasks on navigation.
- Group small idle tasks to reduce scheduling overhead but keep under time budget.

20. Observability
- Emit metrics: tasks scheduled/completed/canceled per priority.
- Log idle task overflows (ran longer than budget).
- Track deferral success ratio (tasks executed post-first-paint / total eligible).

21. Dev Controls
- `DEBUG_SCHEDULER_OVERLAY` to visualize queue.
- Toggle to force-run all tasks immediately for debugging (should be off in prod).
