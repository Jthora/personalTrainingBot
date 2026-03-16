# Scenario 04: Knowledge Seeker

> Persona: `quiz-grinder` — Heavy quiz user. 50+ SR card reviews, 8 quiz sessions, 5 modules with spaced repetition data.

## Purpose

Validates the quiz system end-to-end, spaced repetition scheduling, the ReviewDashboard, and all quiz question types. Tests the knowledge retention pipeline that differentiates this app from a simple drill timer.

## Preconditions

- Archetype: `intelligence`, level 3, XP 1600
- 50+ CardProgress entries across 5 modules (espionage, intelligence, cybersecurity, investigation, agencies) with varying SR intervals
- 8 quiz sessions in QuizSessionStore
- Some cards due for review (nextReviewAt in the past)
- Mobile viewport: 390×844

## Steps

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **ReviewDashboard** | Navigate to `/review` | ReviewDashboard renders: due card count > 0, total tracked cards, card health bars (Mature/Learning/New). |
| 2 | **Forecast chart** | Inspect forecast section | 7-day forecast bar chart visible with non-zero bars. |
| 3 | **Per-module breakdown** | Scroll to module section | Breakdown shows due counts per module (espionage, intelligence, etc.). Modules with 0 due may or may not appear. |
| 4 | **Start review** | Click "Start Review" button | Quiz launches in review mode. Question rendered from SR-due cards specifically. |
| 5 | **Answer multiple-choice** | Read question, select one answer, submit | Correct or incorrect feedback shown. Answer highlight (green/red). Explanation visible if available. Next button appears. |
| 6 | **Answer true/false** | Next question (TF type), select true or false | Same feedback pattern. |
| 7 | **Answer fill-in-blank** | Next question (fill type), type answer, submit | Answer compared (case-insensitive). Correct answer shown if wrong. |
| 8 | **Answer term-match** | Next question (match type), match pairs | Matching interface functional. All pairs matchable. |
| 9 | **Complete quiz** | Finish all questions | Results screen: total score, breakdown by question type, time taken. |
| 10 | **SR scheduling update** | Check CardProgress | Cards reviewed should have updated intervals. Well-answered cards have longer intervals; poorly-answered shorter. |
| 11 | **Retry wrong answers** | Click "Retry wrong answers" (if any wrong) | New quiz with only missed questions. |
| 12 | **Quiz from deck** | Navigate to Train → module → deck → "Quiz this deck" | Deck-scoped quiz launches with cards from that specific deck only. |
| 13 | **Quiz from module** | Back to module, click module-level quiz | Module-scoped quiz launched with cards from all decks in module. |
| 14 | **Empty quiz state** | Navigate to quiz with module that has no SR-due cards | "Not enough card data to generate quiz questions" empty state displayed gracefully. |

## Accessibility Audit Points

- After step 1 (ReviewDashboard) — data visualization screen
- After step 5 (quiz question) — interactive question UI
- After step 9 (quiz results) — results display

## Expected Screenshots

14 screenshots capturing the full quiz journey.

## Key Risks

- ReviewDashboard showing 0 due cards when cards should be due
- Forecast chart rendering empty or with wrong date range
- Quiz not filtering to SR-due cards in review mode
- Fill-in-blank comparison too strict (punctuation/case sensitivity)
- Term-match interface broken on mobile (drag not working, need tap-based matching)
- Retry button not filtering to only incorrect answers
- SR intervals not updating after quiz completion
- Empty state not appearing when expected (silent failure instead)
- Quiz session not recording to QuizSessionStore
