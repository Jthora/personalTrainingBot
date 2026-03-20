# Branding Inventory — Old URL & Name References

> Every instance of old branding that needs to change for the `academy.starcom.app` migration.
>
> **Status**: Audit complete. 33 URL references + GitHub repo links identified.

---

## Domain: `personaltrainingbot.archangel.agency` → `academy.starcom.app`

### index.html (10 references)

| Line | Context | Type |
|------|---------|------|
| L26 | `<meta property="og:url" content="https://personaltrainingbot.archangel.agency">` | OG tag |
| L28 | `<meta property="og:image" content="https://personaltrainingbot.archangel.agency/favicon.png">` | OG image |
| L35 | `<meta name="twitter:image" content="https://personaltrainingbot.archangel.agency/favicon.png">` | Twitter card |
| L38 | `<link rel="canonical" href="https://personaltrainingbot.archangel.agency">` | Canonical URL |
| L48 | `"@id": "https://personaltrainingbot.archangel.agency/#organization"` | JSON-LD |
| L67 | `"@id": "https://personaltrainingbot.archangel.agency/#application"` | JSON-LD |
| L71 | `"url": "https://personaltrainingbot.archangel.agency"` | JSON-LD |
| L96 | `"@id": "https://personaltrainingbot.archangel.agency/#curriculum"` | JSON-LD |
| L100 | `"@id": "https://personaltrainingbot.archangel.agency/#organization"` | JSON-LD ref |
| L163 | `<li><a href="https://personaltrainingbot.archangel.agency">Starcom Academy</a>` | Noscript link |

### public/ files (10 references)

| File | Line | Context |
|------|------|---------|
| `public/llms.txt` | L11 | `- URL: https://personaltrainingbot.archangel.agency` |
| `public/llms.txt` | L86 | Ecosystem node URL |
| `public/ai.txt` | L2 | Comment header URL |
| `public/ai.txt` | L15 | `Live-URL:` field |
| `public/ai.txt` | L52 | Ecosystem node URL |
| `public/.well-known/ai-plugin.json` | L52 | `"logo_url"` |
| `public/humans.txt` | L5 | `Site:` field |
| `public/humans.txt` | L21 | Ecosystem link |
| `public/robots.txt` | L2 | Comment header |
| `public/robots.txt` | L16 | `Sitemap:` URL |
| `public/.well-known/security.txt` | L5 | `Canonical:` URL |

### README.md (2 references)

| Line | Context |
|------|---------|
| L9 | Badge link URL |
| L48 | `<a href="...">personaltrainingbot.archangel.agency</a>` |

### docs/ files (6 references)

| File | Line | Context |
|------|------|---------|
| `docs/guides/ecosystem.md` | L12 | URL display + link |
| `docs/guides/deployment.md` | L7 | Production URL |
| `docs/guides/deployment.md` | L78 | curl command |
| `docs/guides/deployment.md` | L81 | curl command |
| `docs/guides/deployment.md` | L84 | curl command |
| `docs/guides/deployment.md` | L113 | `BASE_URL=` env var |
| `docs/roadmap/overhaul/phase-5-ecosystem/ecosystem-navigation.md` | L43 | Code sample URL |

---

## GitHub Repo: `Jthora/personalTrainingBot`

These are references to the GitHub repository URL. The repo itself may or may not be renamed — document separately.

| File | Line | Context |
|------|------|---------|
| `index.html` | L59 | JSON-LD `sameAs` array |
| `index.html` | L90 | JSON-LD `license` URL |
| `index.html` | L173 | Noscript source link |
| `public/llms.txt` | L13 | `- Source:` field |
| `public/llms.txt` | L131 | `- GitHub:` field |
| `public/ai.txt` | L16 | `Source-URL:` field |
| `public/.well-known/ai-plugin.json` | L54 | `"legal_info_url"` |
| `docs/guides/contributing.md` | L30-31 | Clone command + cd |
| `README.md` | — | Badge/link references |

---

## localStorage Key Prefixes (internal, NOT user-facing)

These use `ptb:` prefix (short for "personalTrainingBot"). They are internal storage keys and **should NOT be changed** (would break existing user data). Documented for awareness.

| Prefix | Examples | Decision |
|--------|----------|----------|
| `ptb:` | `ptb:card-progress:v1`, `ptb:drill-history:v1`, `ptb:quiz-sessions:v1`, `ptb:mission-mode:v1`, `ptb:user-preferences` | **Keep** — internal, data migration cost too high |
| `operative:` | `operative:profile:v1` | **Keep** — internal |
| `mission:` | `mission:intake:v1`, `mission:guidance-mode:v1` | **Keep** — internal |
| `userProgress:v1` | `userProgress:v1` | **Keep** — internal |

---

## Custom Event Names (internal)

| Event | File | Decision |
|-------|------|----------|
| `ptb-cache-status` | `src/components/CacheIndicator/CacheIndicator.tsx` L48 | **Keep** — internal, no user visibility |

---

## Summary

| Category | Count | Action |
|----------|------:|--------|
| Domain URL references | 33 | Replace `personaltrainingbot.archangel.agency` → `academy.starcom.app` |
| GitHub repo URL references | ~10 | Replace if repo is renamed, otherwise keep |
| localStorage key prefixes | ~30 keys | **No change** — internal, breaking change risk |
| Custom event names | 1 | **No change** — internal |
