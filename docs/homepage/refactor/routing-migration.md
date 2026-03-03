# Routing Migration

## Steps
1) Add /home/:section routes with redirect /home -> /home/plan; mount tab shell component.
2) Wire tabs to route changes; preserve skip-to-main target per section.
3) Move existing Home content into new sections (Plan, Cards, Progress, Coach, Settings) incrementally.
4) Remove legacy two-column home layout once sections are populated.
5) Update header/nav links to point to /home/plan (or /home/{section}) as entry.
6) Keep /training, /workouts, /schedules, /settings unchanged; ensure Plan CTA routes to /training.
7) Add internal redirect from /c/:slug to /home/cards?cardSlug=slug with fallback UI.
8) QA deep-links, mobile, A11y; verify cache loading before CardProvider use.

## Rollback
- Retain legacy Home behind a flag or route fallback until completion.
- If tab shell fails, redirect /home to legacy page temporarily.
