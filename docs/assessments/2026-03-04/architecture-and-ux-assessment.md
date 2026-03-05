# Architecture & UX Assessment (Psi Operative Beta) — 2026-03-04

## Context
- Persona: Psi Operative Super Hero Cyber Investigator, Archangel Knights Advanced Internship.
- Current app: Vite/React SPA, fitness/coach-oriented IA; routing shell intact but domain-misaligned; offline posture weak without explicit SW precache.
- Recent fixes: Removed focus-mode auto-redirect; SPA rewrites (vercel.json, _redirects, 404 fallback). Build now passes.

## What Stays
- SPA shell: routing structure, header/tabs scaffold, Card table rendering.
- Local store patterns/contexts (to be extended with mission data).
- Telemetry/perf hooks (can remain console/no-op until real sink).

## What Must Be Upgraded
- IA/labels: Reframe Plan/Cards/Training into mission language (Mission Brief/Kits/Execute or Intel/Drills).
- Content: Replace fitness workouts with mission kits, drills, runbooks (incident response, forensics, OSINT, SIGINT, comms discipline, cognitive resilience). Add scenario chains + AAR templates.
- Readiness: Add readiness score, recency, fatigue/alertness signals; surface on Home.
- Team layer: Shared plans, role assignment, synchronized drills, after-action reviews (even lightweight/mocked to start).
- Offline/stealth: Real SW precache + runtime caching; offline indicator + preload action; mute/haptics toggle; low-data/ops theme.
- Routing robustness: Verified SPA rewrites on all hosts; remove fragile redirects; deep-link test matrix (home/plan/cards/training/c/:slug/share/:slug).
- Security posture: Remove/disable shallow Web3 panel until real value; add basic privacy messaging/auth story.

## What Goes/Is Deprioritized
- Fitness-centric copy/labels that break the mission model.
- Web3 panel in Settings (until it has real auth/privacy value).
- Default heavy assets in critical path (shift to on-demand or “rich mode”).

## Known Gaps / Failures (Beta Tester POV)
- Domain mismatch: No mission kits, no psi/cyber drills; reads like a gym app.
- No operational readiness: No score, trajectory, certification, or mission outcomes.
- Navigation trust: History of redirects; deep links fragile without rewrites/SW.
- Offline fragility: No guaranteed cold offline start; localStorage-only persistence.
- Team vacuum: No shared drills/roles/AARs.
- Stealth gap: No quick mute/haptics/ops theme; loud assets.
- Security/trust: Superficial Web3; no privacy controls; telemetry not persisted.

## Next Steps (proposed sequence)
1) IA/copy pivot + remove misaligned panels (hide Web3 panel).
2) Content swap: Introduce mission kits/drill cards; map Plan→Mission flow, Cards→Intel/Drills, Training→Execute.
3) Readiness dashboard + AAR scaffolding.
4) Offline/stealth hardening: SW precache/runtime caching, offline indicator, preload, mute/low-data toggles.
5) Team/coordination surface (roles, shared timeline, basic AAR) — even mocked initially.

## Follow-up Meeting Agenda
- Align on IA rename and mission-first copy.
- Decide minimal mission kit/drill data model for first drop.
- Choose readiness score inputs (recency, drill difficulty, fatigue proxy) and surface on Home.
- Confirm removal/hiding of Web3 panel and add minimal privacy note.
- Approve offline/stealth scope (SW precache list, offline UI, mute/low-data toggles).
- Set a small deep-link/offline test matrix for acceptance.
