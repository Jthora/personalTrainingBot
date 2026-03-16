# Scenario 05: Profile & Sovereign

> Persona: `veteran-operative` — Level 8, 100+ drills, 30-day streak, all badges, rich history.

## Purpose

Validates identity management, profile editing, settings toggles, data export, and the endgame progression experience. Tests what an invested long-term user sees and interacts with.

## Preconditions

- Archetype: `groundforce`, level 8, XP 4200, 100+ drills
- 30-day streak, all badge unlocks triggered
- 5+ challenges completed, daily/weekly goals configured
- Rich drill history (100+ entries)
- Mobile viewport: 390×844

## Steps

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **Profile surface** | Navigate to `/profile` | Full dossier visible: callsign, division (GroundForce), instructor, enrolled date. Level 8 displayed. |
| 2 | **Edit callsign** | Click edit button, clear field, type "Ghost-Commander", save | Callsign updates to "Ghost-Commander". Change reflected immediately on profile card. |
| 3 | **Verify callsign persistence** | Reload page, check profile | Callsign still reads "Ghost-Commander" after reload. |
| 4 | **Change archetype** | Click "Change archetype" button | Archetype picker appears. Current selection (GroundForce) highlighted. |
| 5 | **Select new archetype** | Pick "Psi Corps", confirm | Profile updates to Psi Corps division. Kit weighting should change on next visit to training surface. |
| 6 | **Toggle Active Duty** | Toggle Active Duty switch | Mission tabs (Brief, Triage, Case, Signal, Debrief) appear in BottomNav. |
| 7 | **Toggle Active Duty off** | Toggle again | Mission tabs disappear from BottomNav. Only 4 primary tabs remain. |
| 8 | **Export data** | Click "Export Data" button | JSON file download triggered. File contains all localStorage keys with their values. |
| 9 | **Navigate to Progress** | Click Progress tab | StatsSurface renders with veteran-level data: Level 8, high XP, 30-day streak, many drills. |
| 10 | **Badge gallery** | Scroll to badge section | Multiple badge icons visible. Each badge has label and unlock date. |
| 11 | **Challenge board** | Check challenges section | Active challenges listed with progress bars. Some completed, some in-progress. |
| 12 | **Competency radar chart** | Check chart section | Radar/spider chart renders with domain scores across multiple axes. Non-zero values. |
| 13 | **Score trend lines** | Check score line chart | 30-day trend lines for top 5 domains. Historical data points visible. |
| 14 | **Activity heatmap** | Check heatmap | 30-day stretch of activity dots. High density for veteran user. |

## Accessibility Audit Points

- After step 1 (profile surface) — form controls + identity display
- After step 9 (stats surface) — charts, badges, data visualization

## Expected Screenshots

14 screenshots covering all profile and progression displays.

## Key Risks

- Callsign not persisting across reload
- Archetype change not updating profile display
- Active Duty toggle not adding/removing mission tabs from BottomNav
- Export Data not including all relevant localStorage keys
- Badge gallery missing unlocked badges (rule evaluation failure)
- Competency chart not rendering (canvas/SVG issue on mobile)
- Score trend chart showing flat lines despite varied history
- Activity heatmap not scaling correctly on mobile viewport
