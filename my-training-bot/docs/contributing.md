# Contributing Guidelines

## Welcome Contributors!

Thank you for your interest in contributing to the Personal Training Bot project. This guide will help you understand how to contribute effectively.

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior
- Be respectful and constructive in all interactions
- Focus on what is best for the community
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
cd personalTrainingBot/my-training-bot
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
- `src/components/` - React components
- `src/pages/` - Page components
- `src/hooks/` - Custom React hooks
- `src/store/` - Zustand stores
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/data/` - Training data and configurations
- `docs/` - Documentation files

## How to Contribute

### Reporting Bugs
When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

Use the bug report template:
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]
```

### Suggesting Features
For feature requests, please include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation approach
- Potential impact on existing functionality

### Pull Requests

#### Before Submitting
1. Check if similar PR already exists
2. Ensure your changes follow project conventions
3. Test your changes thoroughly
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
- Add JSDoc comments for public APIs

```typescript
/**
 * Loads training module data from cache or API
 * @param moduleId - The ID of the module to load
 * @returns Promise resolving to training module data
 */
async function loadTrainingModule(moduleId: string): Promise<TrainingModule> {
  // Implementation
}
```

### React Components
- Use functional components with hooks
- Implement proper prop types
- Use CSS modules for styling
- Follow component naming conventions

```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
};
```

### File Organization
- One component per file
- Use PascalCase for component files
- Use camelCase for utility files
- Group related files in directories

### Git Commit Messages
Use conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

Examples:
```
feat: add new workout category selection
fix: resolve timer synchronization issue
docs: update API documentation
style: improve component styling consistency
refactor: simplify data loading logic
test: add unit tests for card dealer
chore: update dependencies
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests
- Write tests for new features
- Test both happy path and error cases
- Use descriptive test names
- Mock external dependencies

```typescript
describe('CardDealer', () => {
  it('should shuffle deck randomly', () => {
    const deck = createMockDeck();
    const shuffled = CardDealer.shuffleDeck(deck);
    expect(shuffled).not.toEqual(deck);
  });

  it('should deal specified number of cards', () => {
    const deck = createMockDeck();
    const dealt = CardDealer.dealCards(deck, 5);
    expect(dealt).toHaveLength(5);
  });
});
```

## Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Document complex algorithms
- Explain non-obvious business logic
- Keep comments up to date

### README Updates
- Update README for new features
- Add usage examples
- Update installation instructions
- Keep feature lists current

## Release Process

### Versioning
We use semantic versioning (SemVer):
- Major version: Breaking changes
- Minor version: New features
- Patch version: Bug fixes

### Release Notes
Include in release notes:
- New features
- Bug fixes
- Breaking changes
- Migration instructions

## Community

### Communication
- Use GitHub Issues for bugs and features
- Use GitHub Discussions for questions
- Be patient and respectful
- Help others when possible

### Recognition
Contributors are recognized in:
- Release notes
- README contributors section
- Special mentions for significant contributions

## Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Contact the development team

Thank you for contributing to the Personal Training Bot! 🚀
