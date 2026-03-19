# Phase 1 — Domain & URL Migration

> Replace all `personaltrainingbot.archangel.agency` references with `academy.starcom.app`.
>
> **Tasks**: 35 | **Risk**: Zero | **Dependencies**: None
>
> **Approach**: Mechanical find-and-replace. No logic changes, no architecture changes.

---

## Scope

- 33 domain URL replacements across ~12 files
- ~10 GitHub repo URL updates (if repo is renamed)
- No localStorage changes (internal prefixes stay as-is)
- No component/file renames

---

## Task Checklist

### Step 1.1 — index.html (10 tasks)

- [x] `P1-001` L26: `og:url` → `https://academy.starcom.app`
- [x] `P1-002` L28: `og:image` → `https://academy.starcom.app/favicon.png`
- [x] `P1-003` L35: `twitter:image` → `https://academy.starcom.app/favicon.png`
- [x] `P1-004` L38: `canonical` → `https://academy.starcom.app`
- [x] `P1-005` L48: JSON-LD `@id` organization → `https://academy.starcom.app/#organization`
- [x] `P1-006` L67: JSON-LD `@id` application → `https://academy.starcom.app/#application`
- [x] `P1-007` L71: JSON-LD `url` → `https://academy.starcom.app`
- [x] `P1-008` L96: JSON-LD `@id` curriculum → `https://academy.starcom.app/#curriculum`
- [x] `P1-009` L100: JSON-LD provider `@id` → `https://academy.starcom.app/#organization`
- [x] `P1-010` L163: Noscript ecosystem link → `https://academy.starcom.app`

### Step 1.2 — public/ files (11 tasks)

- [x] `P1-011` `public/llms.txt` L11: URL field
- [x] `P1-012` `public/llms.txt` L86: Ecosystem node URL
- [ ] `P1-013` `public/llms.txt` L131: GitHub link (if repo renamed) — skipped, conditional
- [x] `P1-014` `public/ai.txt` L2: Comment header
- [x] `P1-015` `public/ai.txt` L15: `Live-URL:` field
- [ ] `P1-016` `public/ai.txt` L16: `Source-URL:` field (if repo renamed) — skipped, conditional
- [x] `P1-017` `public/ai.txt` L52: Ecosystem node URL
- [x] `P1-018` `public/.well-known/ai-plugin.json` L52: `logo_url`
- [ ] `P1-019` `public/.well-known/ai-plugin.json` L54: `legal_info_url` (if repo renamed) — skipped, conditional
- [x] `P1-020` `public/humans.txt` L5, L21: Site URL, ecosystem link
- [x] `P1-021` `public/robots.txt` L2, L16: Comment + sitemap URL
- [x] `P1-022` `public/.well-known/security.txt` L5: Canonical URL

### Step 1.3 — README.md (2 tasks)

- [x] `P1-023` L9: Badge link URL
- [x] `P1-024` L48: Display URL text + href

### Step 1.4 — docs/ files (6 tasks)

- [x] `P1-025` `docs/guides/ecosystem.md` L12: URL display + link
- [x] `P1-026` `docs/guides/deployment.md` L7: Production URL
- [x] `P1-027` `docs/guides/deployment.md` L78: curl command
- [x] `P1-028` `docs/guides/deployment.md` L81: curl command
- [x] `P1-029` `docs/guides/deployment.md` L84: curl command
- [x] `P1-030` `docs/guides/deployment.md` L113: `BASE_URL=` env var
- [x] `P1-031` `docs/roadmap/overhaul/phase-5-ecosystem/ecosystem-navigation.md` L43: Code sample URL

### Step 1.5 — GitHub repo URLs (conditional — 4 tasks)

> Only if the GitHub repository is being renamed. Otherwise skip.

- [ ] `P1-032` `index.html` L59: JSON-LD `sameAs` GitHub URL — skipped, conditional
- [ ] `P1-033` `index.html` L90: JSON-LD `license` URL — skipped, conditional
- [ ] `P1-034` `index.html` L173: Noscript source link — skipped, conditional
- [ ] `P1-035` `docs/guides/contributing.md` L30-31: Clone command — skipped, conditional

### Step 1.6 — Verification

- [x] `P1-V01` Run `grep -r "personaltrainingbot.archangel.agency" ...` → 0 results ✓
- [x] `P1-V02` Tests pass (1,395/1,395)
- [ ] `P1-V03` Run `npm run test:beta` → deferred to post-deployment
- [ ] `P1-V04` Check `<head>` meta tags in browser dev tools on localhost

---

## Mapping Reference

See [url-mapping.md](url-mapping.md) for the complete old → new URL mapping table.
