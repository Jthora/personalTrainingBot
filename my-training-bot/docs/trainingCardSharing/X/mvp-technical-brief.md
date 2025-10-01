# MVP Technical Brief — X Sharing + Deep Links

Purpose: Single source of truth for the MVP scope and key decisions.

## Objectives
- Share training cards to X with a generated image and concise text.
- Support short deep-link URLs to the shared card.

## Non-goals (MVP)
- No X API OAuth posting/threads.
- No SSR Open Graph tags.

## Scope
- Client-only image capture of a ShareCard template.
- Deep link route `/c/:slug` that hydrates a card by id.

## Key Decisions
- Trust t.co URL normalization (assumed fixed-length cost).
- Slug: deterministic hash(cardId) → Base58 (8–10 chars), collision policy documented.
- Summary text budgeting (title/bullets first, ellipses, ≤2 hashtags).
- Image size 1200x675, Aldrich font, theme colors.

## Acceptance Criteria
- Deep-link opens and highlights target card under IPFS/Vercel.
- Share text ≤280 including URL + tags; sanitized and readable.
- Image export consistent with ShareCard UX and legible.

## Risks & Mitigations
- Fonts/KaTeX readiness → wait for document.fonts.ready + render settled.
- Long content overflow → strict line clamps + truncation.
- IPFS asset paths → relative assets, DNSLink.

## Owners
- Eng lead (tech), PM signoff.
