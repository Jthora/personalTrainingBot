# Progress Tracker — X Sharing & Deep Links

Maintain this document as the single source for rollout progress. Keep updates concise and factual.

Legend: [ ] not-started · [~] in-progress · [x] done · [!] blocked

---

## Phase 1 — MVP: Deep Links + Client Image Sharing

Goal: Share a card to X with a generated image and concise text; open short deep link to the card.
Target window: 
Owner: 

### Step 1 — Foundations & Indexing
- Sub-Step 1.1 — Card Index & Metadata
  - Tasks
    - [x] Build cardId → meta index (module, submodule, deck, color)
      - Subtasks
        - [x] Construct index on initial data load
        - [x] Expose O(1) lookup API
        - [x] Add basic unit tests
      - Status: [x] Completed 2025-09-28 — cache index live with Vitest coverage
      - Owner: Copilot
      - Due: 2025-09-28
      - Links: src/cache/TrainingModuleCache.ts, src/cache/__tests__/TrainingModuleCache.test.ts
- Sub-Step 1.2 — Slug Strategy & Resolver
  - Tasks
    - [x] Choose deterministic slug (hash → Base58, 8–10 chars) and collision policy
      - Subtasks
        - [x] Implement slug generator
        - [x] Round-trip: slug → cardId via index
        - [x] Collision test on dataset (Vitest round-trip)
      - Status: [x] Completed 2025-09-28 — FNV/Base58 slugs validated via tests
      - Owner: Copilot
      - Due: 2025-09-28
      - Links: deeplink-and-slug-spec.md, src/utils/slug.ts, src/utils/__tests__/slug.test.ts

### Step 2 — Deep Link Route
- Sub-Step 2.1 — Routing & Hydration
  - Tasks
    - [x] Add `/c/:slug` route
      - Subtasks
        - [x] Data-readiness gate (show loading until caches ready)
        - [x] Resolve slug → cardId; handle not-found
        - [x] Highlight target card in UI (Home `/` with `cardSlug` query → slot highlight)
      - Status: [x] Completed 2025-09-28 — CTA to open app + highlighted CardSlot (see context + styles)
      - Owner: Copilot
      - Due: 2025-09-28
      - Links: mvp-technical-brief.md, deeplink-and-slug-spec.md, src/pages/CardSharePage/CardSharePage.tsx, src/pages/HomePage/HomePage.tsx, src/context/CardContext.tsx, src/components/CardSlot/CardSlot.tsx

### Step 3 — ShareCard Template (Image UI)
- Sub-Step 3.1 — Visual Template
  - Tasks
    - [x] Implement non-interactive ShareCard mirroring CardSlot
      - Subtasks
        - [x] Layout: title, description, bullets, bubbles, stats, branding
        - [x] Truncation/line clamps (per spec)
        - [x] KaTeX render + fallback
      - Status: [x] Completed 2025-09-27 — ShareCard component shipped (see src/components/ShareCard)
      - Owner: Copilot
      - Due: 2025-09-27
      - Links: sharecard-ux-spec.md, src/components/ShareCard/ShareCard.tsx
- Sub-Step 3.2 — Readiness Checks
  - Tasks
    - [x] Ensure fonts and KaTeX are fully loaded pre-capture
      - Subtasks
        - [x] document.fonts.ready
        - [x] Render-stability tick (rAF) before capture
      - Status: [x] Completed 2025-09-28 — Implemented in ShareCardModal.prepareForCapture
      - Owner: Copilot
      - Due: 2025-09-28

### Step 4 — Client Capture & Export
- Sub-Step 4.1 — Capture Integration
  - Tasks
    - [x] Integrate html-to-image (or equivalent) with pixelRatio 2
      - Subtasks
        - [x] Export PNG/WebP
        - [x] Provide Download and Copy to Clipboard
        - [x] Background color enforced (#001f3f)
      - Status: [x] Completed 2025-09-29 — ShareCardModal exports PNG + WebP (with clipboard PNG) at 2× scale and branded backdrop
      - Owner: Copilot
      - Due: 2025-09-29
- Sub-Step 4.2 — Tweet Summary Text
  - Tasks
    - [x] Implement summary generator within 280 chars (incl. URL + tags)
      - Subtasks
        - [x] Sanitization (whitespace, KaTeX delimiters)
        - [x] Budgeting (reserve URL + ≤2 hashtags + margin)
        - [x] Priority & truncation rules (title > bullet > desc)
      - Status: [x] Completed 2025-09-28 — Implemented in `generateShareSummary` with Vitest coverage
      - Owner: Copilot
      - Due: 2025-09-28
      - Links: summary-generation-rules.md, src/utils/shareSummary.ts, src/utils/__tests__/shareSummary.test.ts

### Step 5 — QA & Release
- Sub-Step 5.1 — Testing
  - Tasks
    - [x] Unit tests: summary, slug, index lookup
    - [ ] E2E: deep link load (local + IPFS/Vercel), highlight card
    - [ ] Visual checks: 3 exemplar cards
    - [ ] Performance: capture < 300ms after ready
      - Status: [~] Vitest suite in place; next up: Playwright smoke for `/c/:slug` → `/` highlight loop, manual visual QA checklist, and capture timing probe in ShareCardModal debug mode
      - Owner: Copilot
      - Due: 
- Sub-Step 5.2 — Release Notes
  - Tasks
    - [ ] Update docs and showcase sample links/images
      - Status: 
      - Owner: 
      - Due: 

---

## Phase 2 — Share Preview & Polish

Goal: Dedicated share preview route; improved truncation/KaTeX edge handling.

### Step 1 — Share Preview Route
- Tasks
  - [ ] `/share/card/:cardId` renders canonical ShareCard in target aspect
    - Subtasks
      - [ ] Minimal chrome (for manual screenshots)
      - [ ] Watermark/short URL footer
    - Status: 
    - Owner: 
    - Due: 

### Step 2 — UX/Rendering Polish
- Tasks
  - [ ] Improve KaTeX edge cases and math-only cards
  - [ ] Refine truncation heuristics with test vectors
    - Status: 
    - Owner: 
    - Due: 

---

## Phase 3 — Optional: Build-time Pre-render Pack

Goal: Pre-generate share images for all cards at build and host under public paths.

### Step 1 — Pipeline
- Tasks
  - [ ] Headless capture script (Playwright) against preview route
    - Subtasks
      - [ ] Wait-for-ready signal; screenshot to `public/share/cards/{cardId}.png`
      - [ ] Manifest `share-images.json`
    - Status: 
    - Owner: 
    - Due: 

---

## Phase 4 — Optional: SSR OG / OAuth

Goal: Add Open Graph previews or X API-based posting as a future enhancement.

### Step 1 — SSR OG
- Tasks
  - [ ] Minimal SSR/edge endpoint for OG tags on `/c/:slug`
    - Status: 
    - Owner: 
    - Due: 

### Step 2 — X API Posting
- Tasks
  - [ ] OAuth + media upload + (optional) threads
    - Status: 
    - Owner: 
    - Due: 

---

## Daily/Weekly Updates
- 2025-09-29 — Added WebP export alongside PNG in Share modal (html-to-image canvas pipeline) and drafted QA plan (Playwright loop, visual checklist, perf timer). Outstanding: implement the E2E/visual/perf validations and prep release docs.
- 2025-09-28 — Share modal now supports PNG download + clipboard copy with readiness guards; summary/slug/cache units covered in Vitest; deep-link CTA now routes back to `/` and highlights the target CardSlot. Still pending: WebP export decision plus E2E, visual, and perf checks.

## Links & References
- README (index): README.md
- Brief: mvp-technical-brief.md
- UX: sharecard-ux-spec.md
- Deep links: deeplink-and-slug-spec.md
- Summary rules: summary-generation-rules.md
