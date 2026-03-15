# Story 0: The Smoke Gate

> *Before testing any promise, verify the house is standing. This story runs in under 10 seconds and catches the failures that would cascade through all 8 stories: the build doesn't serve, the router is broken, the SW doesn't register, or localStorage is inaccessible. If Story 0 fails, nothing else matters.*

## The Promise

The app loads, the SPA shell renders, client-side routing works, and the foundational infrastructure (SW, localStorage, training manifest) is alive.

## Priority

**P0-gate** — This story runs FIRST in every CI pipeline. All other stories depend on it.

## Test Checkpoints

### 0.1 — The app serves and the SPA shell renders

```
Navigate to /
EXPECT: #root has child elements (React mounted)
EXPECT: no uncaught console errors
EXPECT: document.title contains "Starcom Academy"
```

### 0.2 — Client-side routing resolves /mission/brief

```
Navigate to /mission/brief
EXPECT: URL is /mission/brief (not redirected to 404)
EXPECT: page has visible content (not blank)
EXPECT: no "Cannot GET" or server-side 404
```

### 0.3 — Service worker registers

```
EVALUATE: navigator.serviceWorker.controller or navigator.serviceWorker.ready
EXPECT: SW is registered (state is 'activated' or 'activating')
```

### 0.4 — localStorage is accessible

```
EVALUATE: localStorage.setItem('__e2e_probe', '1'); localStorage.getItem('__e2e_probe')
EXPECT: returns '1'
CLEANUP: localStorage.removeItem('__e2e_probe')
```

### 0.5 — Training manifest is fetchable

```
FETCH: /training_modules_manifest.json
EXPECT: 200 OK
EXPECT: response is valid JSON
EXPECT: array length === 19 (all modules present)
```

### 0.6 — At least one training shard loads

```
FETCH: /training_modules_shards/fitness.json
EXPECT: 200 OK
EXPECT: response is valid JSON with module data
```

### 0.7 — Legacy redirect works

```
Navigate to /training/run
EXPECT: URL resolves to /mission/training (client-side redirect)
EXPECT: page renders (not blank or 404)
```

## Failure Modes This Catches

| Failure | What it prevents |
|---------|-----------------|
| Build artifact missing or corrupt | Every test fails with blank page |
| Vite preview server not running | webServer config broken — all specs timeout |
| Router config error | All navigation-based tests fail |
| SW registration broken | Story 08 (offline) fails entirely |
| localStorage blocked (private browsing, quota) | All seeding-based tests fail |
| Training data missing | Stories 03, 05, 08 fail (drills need real cards) |
| Legacy redirects broken | Existing bookmark/deep-link users can't reach app |

## Spec File

`e2e/flows/00-smoke-gate.spec.ts`

## Estimated Duration

~5–8 seconds

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Root | `locator('#root')` |
| Any visible content | `locator('#root >> *:visible')` |
