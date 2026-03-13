# Documentation

> Archangel Knights Training Console — a gamified, offline-first PWA for self-study across 19 training disciplines.

## Quick Navigation

### [Architecture](architecture/)

Core technical reference for understanding how the system works.

| Document | Description |
|----------|-------------|
| [Overview](architecture/overview.md) | Tech stack, data flow, project structure, all layers from routes to static data |
| [API](architecture/api.md) | Internal API for localStorage-backed stores, singleton caches, pub/sub patterns |
| [Cache System](architecture/cache-system.md) | Three singleton caches: TrainingModuleCache, DrillCategoryCache, TrainingHandlerCache |
| [Components](architecture/components.md) | Component architecture by mission surface, drill execution, operative identity |
| [Data Structures](architecture/data-structures.md) | Content hierarchies, type definitions, mission schedule model |
| [Operative Identity](architecture/operative-identity.md) | Sovereign cryptographic identity via Gun.js SEA |

### [Guides](guides/)

Day-to-day developer reference.

| Document | Description |
|----------|-------------|
| [Development](guides/development.md) | Prerequisites, environment setup, project conventions, feature flags |
| [Contributing](guides/contributing.md) | Code of conduct, coding standards, PR process, testing expectations |
| [Deployment](guides/deployment.md) | Build process, Vercel/Netlify/self-hosted, env config, rollback |
| [Troubleshooting](guides/troubleshooting.md) | Common issues: Node version, TS errors, runtime debugging, performance |
| [Ecosystem](guides/ecosystem.md) | The broader Earth Alliance app ecosystem context |

### [Roadmap](roadmap/)

Active planning and strategy.

| Document | Description |
|----------|-------------|
| **[Refined Approach](roadmap/refined-approach.md)** | **The current plan: 3 priorities to fix the core training loop** |
| [Assessments](roadmap/assessments/) | Strategic assessments (latest: March 2026 architecture & UX review) |
| [Major Overhaul](roadmap/major-overhaul/) | Governing plan for the Psi Operative / Archangel Knights reframe (~55 files) |
| [Engineering Overhaul](roadmap/overhaul/) | 7-phase engineering plan: terminology, store factory, flags, tests, bundle, ecosystem, schedule (~26 files) |

### [Features](features/)

Active feature-specific documentation.

| Document | Description |
|----------|-------------|
| [Training Card Sharing](features/training-card-sharing/) | Sharing training cards to X/Twitter with generated images and deep links |
| [Content Authoring](features/content-authoring/) | Card summaryText guidelines, card catalog, and authoring progress |

### [Archive](archive/)

Historical documentation from previous design phases. Superseded by current architecture but preserved for design-intent reference. See [archive/README.md](archive/README.md).

---

## Documentation Structure

```
docs/
├── README.md                  ← you are here
├── architecture/              ← how the system works
├── guides/                    ← how to work in the system
├── roadmap/                   ← where the system is going
├── features/                  ← active feature work
└── archive/                   ← historical docs (superseded)
```
