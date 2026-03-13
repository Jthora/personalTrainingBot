# Rollout Checklist

## Routing
- /home -> /home/plan redirect works.
- Tabs navigate to /home/{section}; history works.
- /c/:slug redirects into /home/cards with slug applied.

## UI/UX
- Single primary CTA on Plan; no duplicate Up Next widgets elsewhere.
- Cards page shows timers/hold/share; no training CTAs.
- Progress/Coach/Settings show only their scoped content.
- Mobile tab bar scrolls; content single-scroll.

## A11y
- Tab roles/aria-selected set; keyboard nav works.
- Skip-to-main focuses section content.
- Visible focus outlines; alerts for slug errors.

## Perf and cache
- InitialDataLoader unchanged; no new blocking scripts.
- Card cache ready before Cards renders content; skeleton shown otherwise.

## QA
- Deep-links: cardSlug, share slug, training entry.
- Start/Resume flows from Plan to Training.
- Regression pass on /workouts, /schedules, /settings.
