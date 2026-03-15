# Contributing to Starcom Academy

## Welcome

You're contributing to the training infrastructure of the Earth Alliance. Every contribution directly strengthens the operative development pipeline. This guide will help you contribute effectively.

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity. The Earth Alliance is built on the principle that sovereignty and mutual respect are foundational.

### Expected Behavior
- Be respectful and constructive in all interactions
- Focus on what strengthens the mission
- Show empathy towards other contributors
- Accept constructive criticism gracefully

### Unacceptable Behavior
- Harassment, discrimination, or inappropriate comments
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing private information without consent

## Getting Started

### Development Setup
1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/personalTrainingBot.git
cd personalTrainingBot
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

### Project Structure
Familiarize yourself with the project structure:
- `src/components/` — React components (49 feature directories)
- `src/pages/` — Mission flow surfaces (Brief, Triage, Case, Signal, Checklist, Debrief, Stats, Plan)
- `src/hooks/` — Custom React hooks (timer, readiness, telemetry, badges)
- `src/store/` — Hand-rolled localStorage stores with pub/sub
- `src/types/` — TypeScript type definitions
- `src/utils/` — Loaders, telemetry, performance, scheduling utilities
- `src/data/` — Static JSON training curriculum (988 files)
- `src/services/` — Gun.js identity, P2P sync
- `src/cache/` — Singleton data caches
- `src/context/` — React context providers
- `docs/` — Documentation

See [README.md](README.md) for the full architecture overview.

## How to Contribute

### Reporting Issues
When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Suggesting Features
For feature requests, include:
- Clear description of the feature
- How it serves the mission (operative training, ecosystem integration, identity, etc.)
- Proposed implementation approach
- Impact on existing functionality

### Pull Requests

#### Before Submitting
1. Check if a similar PR already exists
2. Ensure your changes follow project conventions
3. Test your changes thoroughly (`npm run test`)
4. Update documentation if needed

#### PR Process
1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following coding standards
3. Commit with clear messages:
```bash
git commit -m "feat: add new training module support"
```

4. Push to your fork:
```bash
git push origin feature/your-feature-name
```

5. Create a pull request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots if UI changes
   - Testing instructions

## Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use meaningful variable and function names
- Avoid `any` type usage
- Add JSDoc comments for public APIs

```typescript
/**
 * Records a completed drill and updates operative progress
 * @param drillId - The ID of the completed drill
 * @param elapsedMs - Time spent on the drill in milliseconds
 */
function recordDrillCompletion(drillId: string, elapsedMs: number): void {
  // Implementation
}
```

### React Components
- Use functional components with hooks
- Implement proper TypeScript prop interfaces
- Use CSS Modules for styling (`.module.css`)
- Follow component naming conventions (PascalCase directories)

```typescript
interface DrillCardProps {
  drill: Drill;
  onStart?: () => void;
}

const DrillCard: React.FC<DrillCardProps> = ({ drill, onStart }) => {
  return (
    <div className={styles.container}>
      <h3>{drill.name}</h3>
      {onStart && <button onClick={onStart}>Begin Drill</button>}
    </div>
  );
};
```

### State Management
- Stores are hand-rolled singletons with localStorage persistence
- Follow the existing pattern: `subscribe()`, `notify()`, `getState()`
- No external state libraries (no Redux, Zustand, MobX)
- Use React context for cross-component shared state that doesn't need persistence

### Handler-Aware Theming
- Handler themes are defined in `src/data/handlerThemes.ts`
- `HandlerSelectionContext` applies handler colors to CSS custom properties
- In CSS Modules, use semantic tokens (`var(--surface-card)`, `var(--coach-accent)`)
- When adding new handler-themed components, extend via CSS custom properties — don't hardcode colors

### File Organization
- One component per directory
- PascalCase for component directories and files
- camelCase for utility files
- Group related files together

### Git Commit Messages
Use conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (not CSS)
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

## Mission Copy Standards

When a PR changes user-visible text, ensure mission-aligned language:

- Use **cadet**, not "user" or "player"
- Use **instructor**, not "coach" or "trainer"
- Use **drill**, not "workout" or "exercise" (unless specifically referring to physical exercises within a drill)
- Use **mission cycle**, not "session" or "workflow" for the Brief→Debrief flow
- Use **Starcom Academy**, not "app" or "tool" when referencing the application by name
- Use mission vocabulary for surfaces: Brief, Triage, Case, Signal, Checklist, Debrief

## Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npx vitest --watch

# Run tests with coverage
npx vitest --coverage

# Headless smoke test
npm run smoke:headless

# Operative scenario simulation
BASE_URL=http://localhost:4173 npm run test:psi-scenario
```

### Writing Tests
- Write tests for new features — stores, components, and domain logic
- Test both success paths and error cases
- Use descriptive test names
- Mock external dependencies (localStorage, Gun.js)

```typescript
describe('DrillHistoryStore', () => {
  it('should record a completed drill with elapsed time', () => {
    DrillHistoryStore.record({
      drillId: 'cardio-sprint-01',
      title: 'Sprint Intervals',
      elapsedMs: 45000,
      stepCount: 3,
    });

    const history = DrillHistoryStore.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].drillId).toBe('cardio-sprint-01');
  });
});
```

## Release Process

### Versioning
Semantic versioning (SemVer):
- **Major:** Breaking changes to data structures, store APIs, or identity system
- **Minor:** New features (training modules, surfaces, integrations)
- **Patch:** Bug fixes, content updates, documentation

### Pre-Release Checks
All of the following should pass before cutting a release:
```bash
npm run test
npm run build
npm run smoke:headless
```

## Questions?

If you have questions about contributing:
1. Check the [documentation index](README.md)
2. Search existing GitHub issues
3. Open a new discussion

Thank you for contributing to the Earth Alliance. Every improvement matters.

