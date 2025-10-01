# Summary Generation Rules

## Inputs
- Title, first bullets, optional description, difficulty/focus tags.

## Sanitization
- Collapse whitespace; strip KaTeX delimiters; remove control chars.

## Budgeting
- Reserve characters for URL + 1–2 hashtags + branding; add multibyte margin.

## Priority & Truncation
- Title > first bullet > description > next bullet.
- Word-boundary truncation + ellipsis when exceeding limit.

## Hashtags/Branding
- ≤2 tags (e.g., #Intermediate, #TrainingBot) only if budget permits.

## Test Cases
- Very long bullet, math-only, emoji-heavy, no bullets.
