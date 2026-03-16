# Scenario 08: Module Explorer

> Persona: `day-two-cadet` — Standard returning user. Focus is on training content across all 19 modules.

## Purpose

Systematically browses every single training module in the app, verifying each module's content loads correctly from its JSON shard. Tests the training content pipeline from manifest through shards to rendered deck/card UI. Catches data integrity issues, missing shards, broken module definitions, or rendering failures specific to particular modules.

## Preconditions

- Seeded state: `day-two-cadet`
- Mobile viewport: 390×844
- All 19 training module shards must be available (either cached or fetchable from preview server)

## Steps

### Module Browser Overview

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **Module browser loads** | Navigate to `/train` | ModuleBrowser renders. All 19 module cards visible (may need to scroll). |
| 2 | **Module count** | Count visible modules | Exactly 19 modules rendered. Names match manifest. |
| 3 | **Module metadata** | Inspect any module card | Shows: domain name, card count, deck count, domain score, sparkline trend chart. |

### Per-Module Deep Dive (19 modules)

For each of the 19 modules listed below, the test will:

1. Click into the module from ModuleBrowser
2. Assert DeckBrowser loads with correct breadcrumb ("Training / {Module Name}")
3. Assert at least 1 sub-module with at least 1 deck
4. Assert card previews render (max 5 per deck) with real content
5. Assert "Train this deck" button present on at least 1 deck
6. Capture screenshot
7. Navigate back to ModuleBrowser
8. Assert scroll position is preserved (returned to same module in list)

| # | Module ID | Display Name |
|---|---|---|
| 4 | `agencies` | Agency Training |
| 5 | `combat` | Combat Training |
| 6 | `counter_biochem` | Counter BioChem |
| 7 | `counter_psyops` | Counter PsyOps |
| 8 | `cybersecurity` | Cybersecurity |
| 9 | `dance` | Dance Training |
| 10 | `equations` | Equation Training |
| 11 | `espionage` | Espionage |
| 12 | `fitness` | Field Conditioning |
| 13 | `intelligence` | Intelligence |
| 14 | `investigation` | Investigation |
| 15 | `martial_arts` | Martial Arts |
| 16 | `psiops` | PsiOps Training |
| 17 | `war_strategy` | War Strategy |
| 18 | `web_three` | Decentralized Systems (Web3) |
| 19 | `self_sovereignty` | Self Sovereignty |
| 20 | `anti_psn` | Anti-PSN |
| 21 | `anti_tcs_idc_cbc` | Anti-TCS/IDC/CBC |
| 22 | `space_force` | Space Force Command |

### Quick-Train Spot Checks

| # | Step | Action | Assertions |
|---|---|---|---|
| 23 | **Quick-train: Combat** | Click "Quick Train" on Combat module | DrillRunner starts with 10 cards. Cards have real combat-related content (not generic). |
| 24 | **Quick-train: Cybersecurity** | Click "Quick Train" on Cybersecurity | DrillRunner starts with 10 cards. Cybersecurity-specific content. |
| 25 | **Quick-train: Espionage** | Click "Quick Train" on Espionage | DrillRunner starts with 10 cards. Espionage-specific content. |

### Module Selection

| # | Step | Action | Assertions |
|---|---|---|---|
| 26 | **Toggle module selection** | Check 3 modules, uncheck 1 | Selection state correct (2 checked, 1 unchecked). |
| 27 | **Selection persists** | Navigate away to `/progress`, then back to `/train` | Same 2 modules still checked. |

## Accessibility Audit Points

- After step 1 (ModuleBrowser) — grid layout with interactive cards
- After step 8 (first DeckBrowser) — deck list with action buttons
- After step 23 (DrillRunner from Quick Train) — drill execution context

## Expected Screenshots

27 screenshots:
- 3 for ModuleBrowser overview
- 19 for individual module DeckBrowser views
- 3 for Quick Train drills
- 2 for module selection

## Key Risks

- One or more module shards failing to load (network error or missing file)
- Module with no sub-modules or no decks (data integrity issue)
- Card preview rendering blank cards (shard data present but card structure malformed)
- "Quick Train" selecting cards from wrong module
- Scroll position not restored when returning from DeckBrowser to ModuleBrowser
- Module selection state not persisting across navigation
- Very large modules (many decks) causing performance issues or overflow on mobile
- Breadcrumb showing wrong module name after navigation
