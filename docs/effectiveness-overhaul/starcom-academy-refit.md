# Starcom Academy Refit — Full Implementation Plan

> **Goal**: Transform "Archangel Knights Training Console" → **"Starcom Academy"** — the Earth Alliance's premier officer training platform.
>
> **Scope**: Copy/branding refit across ~45 source files, ~130 string replacements. The app architecture, color system, and mission flow remain unchanged.
>
> **Total tasks**: 122 across 7 phases

---

## Terminology Legend

| Old Term | New Term | Notes |
|----------|----------|-------|
| Archangel Knights Training Console | **Starcom Academy** | Full app name |
| AK Console | **Starcom** | PWA short name |
| Archangel Knights Intake | **Starcom Academy Enrollment** | Onboarding eyebrow |
| Archangel Knights Advanced Internship Program | **Earth Alliance Officer Training Program** | Manifest description |
| Archangel Agency | **Earth Alliance Command** | Header link org |
| Wing Commander Logo | **Starcom Academy Insignia** | Logo alt text |
| Operative | **Cadet** | Identity noun (pre-tier-3), or **Officer** in rank contexts |
| Callsign | **Callsign** | _(keep — standard military)_ |
| Handler | **Instructor** | Training personality |
| Archetype | **Division** | Specialization track |
| Mission Mode | **Active Duty** | Full workflow toggle |
| Mission drill | **training exercise** | Badge/challenge descriptions |
| Personal Training Bot | **Starcom Academy** | Stale 404 title |
| operations (badge desc) | **training** | Badge time-tracking descriptions |
| training intel card | **training card** | Badge description |

---

## Phase 1 — App Identity _(high impact, zero risk)_

String replacements to the app's name, title, and meta across 10 files.

### Step 1.1 — HTML & Manifest

- [ ] `001` **index.html L11**: meta description → `"Starcom Academy — Earth Alliance officer training console"`
- [ ] `002` **index.html L15**: `<title>` → `Starcom Academy`
- [ ] `003` **manifest.webmanifest L3**: `"name"` → `"Starcom Academy"`
- [ ] `004` **manifest.webmanifest L4**: `"short_name"` → `"Starcom"`
- [ ] `005` **manifest.webmanifest L5**: `"description"` → `"Earth Alliance officer training, mission readiness, and field certification console"`
- [ ] `006` **package.json L2**: `"name"` → `"starcom-academy"`
- [ ] `007` **public/404.html L6**: `<title>` → `Starcom Academy`

### Step 1.2 — Header Branding

- [ ] `008` **Header.tsx L70**: `href` → `"https://starcom.academy"` (or remove external link)
- [ ] `009` **Header.tsx L73**: `aria-label` → `"Visit Earth Alliance Command"`
- [ ] `010` **Header.tsx L75**: `alt` → `"Starcom Academy Insignia"`
- [ ] `011` **Header.tsx L82**: `<h1>` text → `Starcom Academy`
- [ ] `012` **Header.tsx L4**: Rename logo import variable comment noting old filename is retained for now (asset rename is Phase 7)

### Step 1.3 — Loading & Welcome Screens

- [ ] `013` **LoadingMessage.tsx L21**: `<h1>` → `Starcom Academy`
- [ ] `014` **ModuleBrowser.tsx L95**: welcome heading → `Welcome to Starcom Academy`
- [ ] `015` **InstallBanner.tsx L21**: text → `Install Starcom Academy for offline access`
- [ ] `016` **MissionIntakePanel.tsx L15**: `"This is your daily training console."` → `"This is your Starcom Academy training console."`

### Step 1.4 — Onboarding Eyebrows

- [ ] `017` **ArchetypePicker.tsx L56**: eyebrow → `Starcom Academy Enrollment`
- [ ] `018` **HandlerPicker.tsx L71**: eyebrow → `Starcom Academy Enrollment`

### Step 1.5 — Config & Schema

- [ ] `019` **.vscode/card-schema.json L4**: description → `"Schema for a single training card in Starcom Academy."`
- [ ] `020` **fixtures.ts L15**: `id` → `'op-sentinel-prime'`
- [ ] `021` **fixtures.ts L19**: `codename` → `'Sentinel Prime'` (and all other `Archangel Alpha` refs in that file)

### Step 1.6 — Test Assertions (identity strings)

- [ ] `022` **Header.test.tsx L56**: `'Archangel Knights Training Console'` → `'Starcom Academy'`
- [ ] `023` **Header.test.tsx L57**: `'Wing Commander Logo'` → `'Starcom Academy Insignia'`
- [ ] `024` **LoadingMessage.test.tsx L10**: `'Archangel Knights Training Console'` → `'Starcom Academy'`
- [ ] `025` **InstallBanner.test.tsx L38**: `/Install the Training Console/` → `/Install Starcom Academy/`
- [ ] `026` **00-smoke-gate.spec.ts L24**: `'Archangel Knights'` → `'Starcom Academy'` (also update `'Training Console'` fallback)

**Phase 1 total: 26 tasks, ~15 files**

---

## Phase 2 — Terminology: Operative → Cadet _(medium impact, low risk)_

Replace user-visible "Operative" with "Cadet" (or context-appropriate variant) across components. Internal variable/component names unchanged.

### Step 2.1 — Profile Surface

- [ ] `027` **ProfileSurface.tsx L51**: `"Operative Identity"` → `"Cadet Dossier"`
- [ ] `028` **ProfileSurface.tsx L74**: `"No operative profile configured."` → `"No cadet profile configured."`

### Step 2.2 — Identity Card

- [ ] `029` **OperativeIdentityCard.tsx L29**: `aria-label` → `"Cadet identity"`
- [ ] `030` **OperativeIdentityCard.tsx L30**: `"No operative profile configured."` → `"No cadet profile configured."`
- [ ] `031` **OperativeIdentityCard.tsx L36**: `aria-label` → `"Cadet identity"`

### Step 2.3 — Sovereignty Panel

- [ ] `032` **SovereigntyPanel.tsx L127**: fallback `'Operative'` → `'Cadet'`
- [ ] `033` **SovereigntyPanel.tsx L136**: fallback `'operative'` → `'cadet'`
- [ ] `034` **SovereigntyPanel.tsx L221**: `'Remove operative keypair…'` → `'Remove cadet keypair…'`
- [ ] `035` **SovereigntyPanel.tsx L253**: `'Operative keypair not initialized'` → `'Cadet credentials not initialized'`
- [ ] `036` **SovereigntyPanel.tsx L387**: `aria-label` → `'Export cadet keypair'`
- [ ] `037` **SovereigntyPanel.tsx L391**: overlay title → `'Export Cadet Keypair'`
- [ ] `038` **SovereigntyPanel.tsx L519**: label → `'Cadet keypair QR code'`
- [ ] `039` **SovereigntyPanel.tsx L545**: `aria-label` → `'Import cadet keypair'`
- [ ] `040` **SovereigntyPanel.tsx L549**: overlay title → `'Import Cadet Keypair'`

### Step 2.4 — Badge Catalog

- [ ] `041` **badgeCatalog.ts L19**: `name: 'Persistent Operative'` → `'Persistent Cadet'`
- [ ] `042` **badgeCatalog.ts L25**: `name: 'Ace Operative'` → `'Ace Cadet'`

### Step 2.5 — SOP Hint

- [ ] `043` **MissionShell.tsx L88**: `'Review operative metrics'` → `'Review cadet metrics'`

### Step 2.6 — Test Assertions (operative strings)

- [ ] `044` **OperativeIdentityCard.test.tsx L57**: `'No operative profile configured.'` → `'No cadet profile configured.'`
- [ ] `045` **OperativeIdentityCard.test.tsx L91/94**: `'Operative identity'` → `'Cadet identity'`
- [ ] `046` **ProfileSurface.test.tsx L27**: test description `'shows operative identity'` → `'shows cadet dossier'`
- [ ] `047` **AppShell.test.tsx L107**: `queryByText('Mission Mode')` → `queryByText('Active Duty')`

**Phase 2 total: 21 tasks, ~8 files**

---

## Phase 3 — Terminology: Handler → Instructor _(medium impact, low risk)_

Replace user-visible "Handler" with "Instructor". Internal type names, store names, and prop names unchanged.

### Step 3.1 — Picker & Profile Labels

- [ ] `048` **HandlerPicker.tsx L70**: `aria-label` → `"Choose your instructor"`
- [ ] `049` **HandlerPicker.tsx L72**: heading → `"Choose Your Instructor"`
- [ ] `050` **HandlerPicker.tsx L73-74**: subtitle → `"Your instructor shapes mission personality, SOP tone, and training style. The recommended instructor is matched to your division."`
- [ ] `051` **ProfileSurface.tsx L63**: label → `"Instructor"`
- [ ] `052` **OperativeIdentityCard.tsx L57**: label → `"Instructor"`
- [ ] `053` **ArchetypePicker.tsx L59**: `"recommended handler"` → `"recommended instructor"`

### Step 3.2 — Recap Copy

- [ ] `054` **recapVariants.ts L276**: `'Handler debrief'` → `'Instructor debrief'`

### Step 3.3 — Test Assertions (handler strings)

- [ ] `055` **OperativeIdentityCard.test.tsx L70**: assertion for handler name `'Tiger War God'` → new name (Phase 5 dependency — update simultaneously)
- [ ] `056` **HandlerPicker.test.tsx L36**: `'Tiger War God'` → new name (Phase 5 dependency)

**Phase 3 total: 9 tasks, ~6 files**

---

## Phase 4 — Terminology: Archetype → Division + Mission Mode → Active Duty _(medium impact, low risk)_

### Step 4.1 — Archetype → Division Labels

- [ ] `057` **ArchetypePicker.tsx L55**: `aria-label` → `"Choose your training division"`
- [ ] `058` **ArchetypePicker.tsx L57**: heading → `"Choose Your Division"`
- [ ] `059` **ArchetypePicker.tsx L58-59**: subtitle → `"Your division determines your core training modules, recommended instructor, and milestone progression path. You can change this later."`
- [ ] `060` **ProfileSurface.tsx L60**: label → `"Division"`

### Step 4.2 — Mission Mode → Active Duty

- [ ] `061` **ProfileSurface.tsx L84**: label → `"Active Duty"`
- [ ] `062` **ProfileSurface.tsx L85-86**: hint → `"Show full mission workflow tabs (Brief, Triage, Case, Signal, Debrief)"`  _(keep as-is or lightly adjust)_
- [ ] `063` **AppShell.tsx L170**: `"Mission Mode"` → `"Active Duty"`
- [ ] `064` **appShellTabs.ts L5**: comment → `"Active Duty"` reference
- [ ] `065` **appShellTabs.ts L12**: comment → `"Active Duty"` reference

### Step 4.3 — TodayLauncher Copy

- [ ] `066` **TodayLauncher.tsx L129**: `archetype.name Training` → `archetype.name Exercises` (renders as e.g. "Search & Rescue Exercises")
- [ ] `067` **TodayLauncher.tsx L144**: `archetype.name kit` → `archetype.name curriculum`

### Step 4.4 — Test Assertions

- [ ] `068` **AppShell.test.tsx L107**: `'Mission Mode'` → `'Active Duty'`
- [ ] `069` **ProfileSurface.test.tsx L34,40,48**: test descriptions `'mission mode'` → `'active duty'`
- [ ] `070` **TodayLauncher.test.tsx L117**: `'Rescue Ranger Training'` → updated division name + `' Exercises'`
- [ ] `071` **TodayLauncher.test.tsx L130**: `'Rescue Ranger kit'` → updated division name + `' curriculum'`

**Phase 4 total: 15 tasks, ~7 files**

---

## Phase 5 — Data Refit: Archetypes, Handlers, Badges _(high effort, narrative scope)_

Rewrite the 8 archetype definitions, 5 handler personas, and 10 badge entries to fit the Starcom Academy universe.

### Step 5.1 — Archetype → Division Data

All changes in **archetypes.ts**. Each archetype gets a new `name`, `description`, and `milestoneLabels`.

- [ ] `072` `rescue_ranger` → **Search & Rescue**: name, description, milestones
  - Name: `'Search & Rescue'`
  - Description: _"First responder and extraction specialist. Trained in field triage, hazard navigation, and civilian protection under hostile conditions."_ → Rewrite for Earth Alliance SAR context
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (SAR)', 'Tier III · Lieutenant (SAR)', 'Tier IV · Commander (SAR)']`

- [ ] `073` `cyber_sentinel` → **CyberCom**: name, description, milestones
  - Name: `'CyberCom'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Cyber)', 'Tier III · Lieutenant (Cyber)', 'Tier IV · Commander (Cyber)']`

- [ ] `074` `psi_operative` → **Psi Corps**: name, description, milestones
  - Name: `'Psi Corps'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Psi)', 'Tier III · Lieutenant (Psi)', 'Tier IV · Commander (Psi)']`

- [ ] `075` `shadow_agent` → **Intelligence Division**: name, description, milestones
  - Name: `'Intelligence Division'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Intel)', 'Tier III · Lieutenant (Intel)', 'Tier IV · Commander (Intel)']`

- [ ] `076` `cosmic_engineer` → **Engineering Corps**: name, description, milestones
  - Name: `'Engineering Corps'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Eng)', 'Tier III · Lieutenant (Eng)', 'Tier IV · Commander (Eng)']`

- [ ] `077` `tactical_guardian` → **GroundForce**: name, description, milestones
  - Name: `'GroundForce'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Ground)', 'Tier III · Lieutenant (Ground)', 'Tier IV · Commander (Ground)']`

- [ ] `078` `star_commander` → **Fleet Command**: name, description, milestones
  - Name: `'Fleet Command'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Fleet)', 'Tier III · Lieutenant (Fleet)', 'Tier IV · Commander (Fleet)']`

- [ ] `079` `field_scholar` → **Diplomatic Corps**: name, description, milestones
  - Name: `'Diplomatic Corps'`
  - Milestones: `['Tier I · Cadet', 'Tier II · Ensign (Diplo)', 'Tier III · Lieutenant (Diplo)', 'Tier IV · Commander (Diplo)']`

### Step 5.2 — Handler → Instructor Data

All changes in **handlers.ts**. Each handler gets a new `name`, `personality`, `description`, `specializations`. The `id` fields are stable (used in stored profiles).

- [ ] `080` `tiger_fitness_god` → **Cmdr. Tygan**: name, personality, description, specializations
  - Name: `'Commander Tygan'`
  - Personality: `'Combat conditioning instructor — EarthForce GroundForce drill sergeant'`

- [ ] `081` `jono_thora` → **Lt. Cmdr. Tho'ra**: name, personality, description, specializations
  - Name: `"Lt. Commander Tho'ra"`
  - Personality: `'Advanced systems instructor — quantum operations and engineering specialist'`

- [ ] `082` `tara_van_dekar` → **Prof. Van Dekar**: name, personality, description, specializations
  - Name: `'Professor Van Dekar'`
  - Personality: `'Psi Corps liaison instructor — esoteric warfare and consciousness defense specialist'`

- [ ] `083` `agent_simon` → **Agent Simon**: name adjustments, personality, description rewrites
  - Name: `'Agent Simon'` _(keep)_
  - Personality: `'Intelligence instructor — covert operations and counter-intelligence specialist'`
  - Description: replace `"He trains operatives"` → `"He trains cadets"`

- [ ] `084` `star_commander_raynor` → **Captain Raynor**: name, personality, description
  - Name: `'Captain Raynor'`
  - Personality: `'Fleet operations instructor — mission command and contingency planning specialist'`

### Step 5.3 — Badge Descriptions

All changes in **badgeCatalog.ts**. Names and descriptions that reference old terminology.

- [ ] `085` `streak_7`: name `'Persistent Operative'` → `'Persistent Cadet'` _(done in Phase 2, task 041)_
- [ ] `086` `streak_30`: _(keep 'Iron Protocol' — fits military)_
- [ ] `087` `minutes_60`: description `'Log 60 minutes of operations in a single day'` → `'Log 60 minutes of training in a single day'`
- [ ] `088` `minutes_300`: description `'Log 300 minutes of operations in a single week'` → `'Log 300 minutes of training in a single week'`
- [ ] `089` `completion_10–100`: descriptions `'Complete N mission drills'` → `'Complete N training exercises'` (3 badges)
- [ ] `090` `completion_100`: name `'Ace Operative'` → `'Ace Cadet'` _(done in Phase 2, task 042)_
- [ ] `091` `share_card`: description `'Share a training intel card'` → `'Share a training card'`

### Step 5.4 — Challenge Catalog

- [ ] `092` **challengeCatalog.ts L26**: `'Complete 2 mission drills today'` → `'Complete 2 training exercises today'`
- [ ] `093` **challengeCatalog.ts L44**: `'Complete 5 mission drills this week'` → `'Complete 5 training exercises this week'`

### Step 5.5 — Milestones

- [ ] `094` **milestones.ts L28**: `'Complete at least one mission drill path.'` → `'Complete at least one training exercise path.'`

### Step 5.6 — Test Assertions (data-driven)

Tests that assert specific archetype/handler names from the data layer need updating to match the new names.

- [ ] `095` **OperativeIdentityCard.test.tsx L17**: mock archetype `name: 'Rescue Ranger'` → `'Search & Rescue'`
- [ ] `096` **OperativeIdentityCard.test.tsx L37**: mock handler `name: 'Tiger War God'` → `'Commander Tygan'`
- [ ] `097` **OperativeIdentityCard.test.tsx L69**: assertion `'Rescue Ranger'` → `'Search & Rescue'`
- [ ] `098` **OperativeIdentityCard.test.tsx L70**: assertion `'Tiger War God'` → `'Commander Tygan'`
- [ ] `099` **OperativeIdentityCard.test.tsx L89**: assertion `'Rescue Ranger'` → `'Search & Rescue'`
- [ ] `100` **OperativeIdentityCard.test.tsx L99**: `getByAltText('Tiger War God')` → `'Commander Tygan'`
- [ ] `101` **HandlerPicker.test.tsx L36**: `'Tiger War God'` → `'Commander Tygan'`
- [ ] `102` **TodayLauncher.test.tsx L117**: `'Rescue Ranger Training'` → `'Search & Rescue Exercises'`
- [ ] `103` **TodayLauncher.test.tsx L130**: `'Rescue Ranger kit'` → `'Search & Rescue curriculum'`
- [ ] `104` **ProfileEditor.test.tsx L58**: mock handler `name: 'Tiger War God'` → `'Commander Tygan'`

**Phase 5 total: 33 tasks, ~8 files**

---

## Phase 6 — Discipline Display Names _(low risk, optional)_

The `DisciplineVisual` interface has no `label` field — discipline names are derived from IDs. Add an optional display label to the theme map for disciplines that should show a Starcom-flavored name.

### Step 6.1 — Add label to DisciplineVisual

- [ ] `105` **disciplineTheme.ts**: Add optional `label?: string` field to `DisciplineVisual` interface
- [ ] `106` Add `label` to these entries:
  - `space_force` → `'Fleet Ops'`
  - `psiops` → `'Psi Corps Training'`
  - `agencies` → `'Division Command'`
  - `war_strategy` → `'Tactical Doctrine'`
  - `anti_psn` → `'Counter-Surveillance'` _(optional)_
  - `anti_tcs_idc_cbc` → `'Counter-Institutional Ops'` _(optional)_

### Step 6.2 — Consume label in UI

- [ ] `107` Update `getDisciplineVisual()` or add a `getDisciplineLabel(id)` helper that returns `label ?? humanized id`
- [ ] `108` Wire the label into components that display discipline names (ModuleBrowser, drill headers, stats, etc.) — audit which components currently derive display names from IDs

### Step 6.3 — Tests

- [ ] `109` Add unit tests for `getDisciplineLabel()` — returns label when present, falls back to humanized ID

**Phase 6 total: 5 tasks, ~3 files**

---

## Phase 7 — Polish & Assets _(deferred, lower priority)_

Visual assets, documentation, and optional internal renames.

### Step 7.1 — Logo & Icon Assets

- [ ] `110` Design/source a Starcom Academy insignia (SVG) to replace current logo
- [ ] `111` Replace `public/icon.svg` with new insignia
- [ ] `112` Replace `public/icon-maskable.svg` with new maskable version
- [ ] `113` Replace `public/favicon.png` with new 64×64 icon
- [ ] `114` Replace `public/favicon.ico` with new ICO
- [ ] `115` Rename `WingCommanderLogo-288x162.gif` in `src/assets/images/` (or replace with new asset)
- [ ] `116` Update Header.tsx import path if asset filename changes
- [ ] `117` Rename `StarcomCommander_01.png` → `captain_raynor-icon.png` for consistency

### Step 7.2 — Documentation Batch Update

- [ ] `118` Batch find/replace "Archangel Knights Training Console" → "Starcom Academy" across `docs/` (~60 references)
- [ ] `119` Update `README.md` badge URL and description
- [ ] `120` Update `docs/guides/ecosystem.md` URL references
- [ ] `121` Update `docs/guides/deployment.md` URL references

### Step 7.3 — Comment Cleanup

- [ ] `122` Update `SovereigntyPanel.tsx` JSDoc comments (L2, L6) from "operative" to "cadet"

**Phase 7 total: 13 tasks**

---

## Summary

| Phase | Focus | Tasks | Files | Risk |
|-------|-------|-------|-------|------|
| 1 — App Identity | Name, title, meta, onboarding | 26 | ~15 | Zero |
| 2 — Operative → Cadet | Identity terminology | 21 | ~8 | Low |
| 3 — Handler → Instructor | Instructor terminology | 9 | ~6 | Low |
| 4 — Archetype → Division | Division + Active Duty | 15 | ~7 | Low |
| 5 — Data Refit | Archetype/handler/badge content | 33 | ~8 | Medium (narrative) |
| 6 — Discipline Labels | Optional display names | 5 | ~3 | Low |
| 7 — Polish & Assets | Icons, docs, comments | 13 | — | Deferred |
| **Total** | | **122** | **~45** | |

### What Stays Unchanged

- **Color palette** — `#5A7FFF` EarthForce blue, dark console surfaces, blue-tinted text
- **Typography** — Aldrich (military display), Inter (institutional body)
- **Tab labels** — Brief, Triage, Case, Signal, Debrief
- **SOP prompts** — operationally neutral military language
- **Mission flow structure** — Brief → Triage → Case → Signal → Debrief
- **AAR system** — standard military terminology
- **19 discipline IDs, colors, and icons** — `disciplineTheme.ts` palette unchanged
- **All localStorage keys** — `ptb:`, `operative:`, `mission:` prefixes stay (internal)
- **Component/file names** — `OperativeIdentityCard`, `MissionKitStore`, etc. stay (internal)
- **1,402 tests** — updated assertions only, no structural test changes

### Execution Notes

1. **Phases 1–4 are pure string replacements** — can be done mechanically with high confidence
2. **Phase 5 requires creative writing** — archetype descriptions and handler personas need to be authored in the Starcom universe voice
3. **Phase 6 is additive** — new field + helper, no existing code breaks
4. **Phase 7 is independent** — art assets and docs can happen anytime
5. **Test updates are co-located with their source changes** — each phase includes its test assertion updates
6. **Run `vitest` after each phase** to confirm all 1,402 tests still pass
