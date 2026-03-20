# UX Gaps — Loading, Onboarding, Error States & Missing Feedback

> Every place the user experience has a gap, missing state, or broken behavior.
>
> **Status**: Audit complete.

---

## Critical: No HTML Splash Screen

**Current behavior**: Between `index.html` load and React mount, the user sees a **blank white screen**. The `<body>` contains only `<div id="root"></div>`. The `<noscript>` block has content, but JS users see nothing.

**Impact**: On slow connections, cold cache, or large bundle loads, users see a white flash against the `#040709` dark theme. Perceived load time is terrible.

**Fix**: Add a CSS-only splash screen inside `<div id="root">` that shows immediately and gets replaced when React mounts. Must match the dark theme (`--surface-base: #040709`).

---

## Critical: No Onboarding in AppShell v2

**Current behavior**: The entire onboarding flow (guidance overlay → archetype picker → handler picker → intake panel) is **wired only in MissionShell** (v1). In AppShell v2 (now the production default), there is **no first-time user experience**.

New users landing on `/train` see:
- A small "Welcome to Starcom Academy" banner in ModuleBrowser (only if 0 drills completed)
- No archetype/division selection
- No instructor/handler selection
- No intake panel explaining the app

**Impact**: First-time users get no onboarding, no context, and no personalization.

**Fix**: Port the onboarding flow from MissionShell into AppShell v2, or create a new streamlined onboarding for the v2 shell.

---

## High: LoadingMessage is Generic

**Current component** (`src/components/LoadingMessage/LoadingMessage.tsx`):
- Shows "Starcom Academy" title
- Generic spinner + "App Loading..." text
- Progress bar (width-based)
- No branding imagery, no character, no identity

**Issues**:
- Uses kebab-case CSS classes (inconsistent with all other components)
- Says "App Loading" — generic, not in-universe
- No visual tie to the Starcom Academy brand/aesthetic
- Background is plain `--surface-base` with no gradients or character

**Fix**: Redesign to match Starcom identity — military console aesthetic, academy insignia, themed loading copy.

---

## Medium: NetworkStatusIndicator Always Visible

**Current behavior**: Shows "Ready" text pill at all times when online. Fixed position at bottom-left. `pointer-events: none` (already fixed).

**Impact**: Visual noise with zero informational value. Most apps only show network status on change (offline → online or online → offline).

**Fix**: 
- Only show when offline
- Optionally show briefly on transition (offline → online: "Back Online" for 3s, then hide)
- Remove the always-visible "Ready" state

---

## Medium: No 404 Page

**Current behavior**: `<Route path="*" element={<Navigate to={defaultRoot} replace />}` — invalid routes silently redirect to `/train`. No user feedback about the invalid URL.

**The static `public/404.html`** exists but is for CDN/server-level 404s only.

**Fix**: Create a proper React 404 component that:
- Shows "Page not found" with Starcom theming
- Links back to `/train`
- Optionally logs the invalid route for analytics

---

## Low: Suspense Fallback is Null

| File | Line | Component | Issue |
|------|------|-----------|-------|
| `App.tsx` | L154 | `RecapToast` + `RecapModal` | `<Suspense fallback={null}>` — shows nothing while lazy-loading. If triggered immediately after data load, user sees no feedback. |

**Fix**: Replace `null` with `SurfaceLoader` or a minimal spinner.

---

## Low: No Skeleton/Shimmer Loading States

Individual surfaces (`TrainingSurface`, `StatsSurface`, etc.) perform data loading after code-split load. During this data-loading phase, there's no intermediate shimmer or skeleton UI — just the `SurfaceLoader` from the Suspense boundary.

**Fix**: Add shimmer skeletons for the most common surfaces (Train, Progress).

---

## Low: Missing Error State Feedback

When `ErrorBoundary` catches at `level="route"`, it renders a retry button. But:
- No telemetry is sent for route-level errors
- The error message is generic
- No "report this issue" CTA

---

## Summary

| Priority | Gap | Phase |
|----------|-----|-------|
| Critical | Blank white splash screen | Phase 3 |
| Critical | No onboarding in AppShell v2 | Phase 3 |
| High | Generic LoadingMessage | Phase 3 |
| Medium | NetworkIndicator always visible | Phase 3 |
| Medium | No 404 page | Phase 6 |
| Low | Suspense fallback=null | Phase 6 |
| Low | No skeleton loading states | Phase 6 |
| Low | Generic error boundary | Phase 6 |
