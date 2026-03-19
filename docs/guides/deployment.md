# Deployment Guide

## Overview

This guide covers deploying Starcom Academy to production. The application is a static PWA — after building, it produces a `dist/` directory that can be served from any static hosting platform.

**Production URL:** [academy.starcom.app](https://academy.starcom.app)

## Prerequisites

- Node.js 18 or higher
- npm package manager

## Build Process

### Production Build
```bash
npm run build
```

The build process:
1. Generates combined training data (`generate-training-data-combined`)
2. Generates path mappings for modules, submodules, card decks, and workout categories
3. TypeScript compilation (`tsc -b`)
4. Vite bundling and optimization

Output is written to `dist/`.

### Environment Configuration

Feature flags and environment can be configured at build time:

```bash
# Staging build with specific flags
VITE_APP_ENV=staging npm run build

# Production build with mission default routes disabled (rollback)
npm run rollback:mission-default
```

## Deployment Options

### Vercel (Primary)

The project includes `vercel.json` for configuration. SPA fallback routing is configured to direct all requests to `index.html`.

#### Automatic Deployment
1. Connect the GitHub repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Pushes to `main` deploy automatically

#### Manual Deployment
```bash
npx vercel --prod
```

### Static Hosting (Netlify, GitHub Pages, S3, etc.)

Build settings for any static host:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18+
- **SPA fallback:** Route all paths to `index.html`

## Post-Deploy Verification

### Caching Headers

The `public/_headers` file ships cache policies:
- **HTML:** `no-cache` (always fresh)
- **Hashed assets (`/assets/*`):** 1 year, immutable
- **Training manifest:** 5 minutes
- **Training shards/JSON:** 1 day with stale-while-revalidate

Verify headers after deploy:
```bash
# Manifest should be short-lived
curl -I https://academy.starcom.app/training_modules_manifest.json | grep -i cache-control

# Shards should be cached but revalidated daily
curl -I https://academy.starcom.app/training_modules_shards/fitness.json | grep -i cache-control

# Hashed assets should be immutable
curl -I https://academy.starcom.app/assets/index-\*.js | grep -i cache-control
```

### Service Worker Verification

The service worker (`/sw.js`) registers automatically in production:
- Precaches critical assets with versioned keys
- Cache-first for training data, stale-while-revalidate for media
- Navigation fallback to `index.html`
- `SKIP_WAITING` for seamless updates

QA steps (requires preview or production host):
```bash
# Start preview server
npm run preview -- --host --port 4173

# Verify offline capability
npm run check:sw-offline -- --base=http://localhost:4173 --shard=/training_modules_shards/fitness.json

# Verify offline indicator
npm run check:offline-indicator -- --base=http://localhost:4173
```

### Smoke Tests
```bash
# Headless smoke test
npm run smoke:headless

# Full operative scenario simulation
BASE_URL=https://academy.starcom.app npm run test:psi-scenario
```

### Mission Route Verification
```bash
# Verify deep links resolve correctly
npm run check:deeplinks

# Offline deep link verification
npm run check:deeplinks-offline

# Payload budgets within limits
npm run check:payload-budgets

# Mission route payload budgets
npm run check:mission-route-budgets
```

## Performance Monitoring

### Bundle Analysis
```bash
# Generate bundle visualization
npm run analyze

# Payload size report
npm run report:sizes

# Mission route payload report
npm run report:mission-route-payloads

# Render cycle profiling
npm run report:mission-render-cycles
```

### Budget Checks
```bash
# Verify payload sizes are within budget
npm run check:payload-budgets

# Verify precache size is within budget
npm run check:precache-size

# Verify encoding optimization
npm run check:encodings
```

## Rollback

### Vercel
Use the Vercel dashboard to instantly rollback to a previous deployment, or redeploy from a specific Git commit.

### Manual
```bash
git checkout <previous-release-tag>
npm run build
# Deploy dist/ using your preferred method
```

### Mission Default Routes Rollback
To disable mission default routes and revert to legacy routing:
```bash
npm run rollback:mission-default
```

## Security Considerations

- **HTTPS:** Always use HTTPS in production. The service worker requires a secure context.
- **Sovereign identity:** Operative keypairs are generated and stored client-side. No private key material should ever transit a server.
- **Content Security Policy:** Configure CSP headers appropriate to your hosting platform. The application requires `'self'` for scripts and styles plus `'unsafe-inline'` for dynamic style injection.

## Ecosystem Deployment

Starcom Academy is one part of the Earth Alliance ecosystem. Other applications:

| Application | URL |
|---|---|
| Starcom | [starcom.app](https://starcom.app) |
| Navcom | [navcom.app](https://navcom.app) |
| Tactical Intel Dashboard | [tacticalinteldashboard.archangel.agency](https://tacticalinteldashboard.archangel.agency) |
| Mecha Jono | [mecha.jono.archangel.agency](https://mecha.jono.archangel.agency) |

Cross-ecosystem integration (operative identity portability, telemetry bridges) should be coordinated across deployments. See [ecosystem.md](ecosystem.md) for architecture details.
