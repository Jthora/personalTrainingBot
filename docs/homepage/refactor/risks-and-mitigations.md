# Risks and Mitigations

- State drift between tabs (cards vs plan): use shared stores; keep CardProvider scoped to Cards; avoid duplicating schedule state.
- Deep-link breakage for cardSlug: keep /c/:slug redirect; graceful error state if slug missing; add tests.
- CTA duplication creeping back: enforce CTA strategy; lint or review against page-ownership map.
- Mobile nav regressions: test tab scroll/dropdown; keep single scroll container.
- Auth/profile discoverability after moving to Settings: add clear entry from header (icon/link) if needed.
- Perf regression from tab shell: measure bundle delta; code-split sections if heavy.
- User confusion Plan vs Training: label CTA clearly and optionally expose focus mode toggle.
