# IA Plan

## Route model
- Nested home routes: /home/:section with redirect /home -> /home/plan.
- Sections: plan, cards, progress, coach, settings.
- Keep existing top-level routes: /training, /workouts, /schedules, /settings, /c/:slug.

## Tabs vs routes
- Use routed tabs: tab clicks push /home/{section}. Active state from route, not local state.
- Allow optional mode query for Plan focus: /home/plan?mode=focus (preferred over nested /home/plan/focus to keep IA flat).
- Plan remains overview; Training stays at /training for execution. A "focus mode" toggle on Plan may route into /training or set mode query for a lightweight embedded view.

## Deep-links
- Card share remains /c/:slug; internally redirect to /home/cards?cardSlug={slug} and hydrate CardProvider.
- If already on /home/cards, applying cardSlug replaces slot 0 and highlights it.
- Unknown slug: show friendly error and keep Cards usable.

## Relationships
- Plan links to Training for execution; Training remains immersive.
- Workouts/Schedules stay as standalone builders; Plan summarizes, not edits.
- Settings tab in home mirrors key prefs; full settings can stay at /settings.
