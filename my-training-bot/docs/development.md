# Development Guide

## Development Setup

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Personal Training Bot
VITE_APP_VERSION=1.0.0
```

### Project Structure Conventions

#### Component Organization
- Each component should have its own directory
- Include TypeScript interfaces in the same file
- Use descriptive naming conventions
- Group related components together

#### File Naming
- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase.ts`
- Styles: `kebab-case.css`

#### Import Organization
```typescript
// External libraries
import React from 'react';
import { useState } from 'react';

// Internal components
import Button from '../Button/Button';
import Modal from '../Modal/Modal';

// Types
import { TrainingModule } from '../../types/TrainingModule';

// Utilities
import { formatDate } from '../../utils/dateUtils';

// Styles
import './ComponentName.css';
```

### Code Quality Standards

#### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all props and state
- Avoid `any` type usage
- Use proper generic types

#### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow React accessibility guidelines

#### CSS Organization
- Use CSS modules or styled-components
- Follow BEM naming convention
- Maintain consistent spacing and typography
- Use CSS custom properties for themes

### Testing Guidelines

#### Unit Tests
- Test individual components and functions
- Use React Testing Library for component tests
- Maintain high test coverage
- Test edge cases and error scenarios

#### Integration Tests
- Test component interactions
- Verify API integrations
- Test user workflows
- Validate data flow

### Performance Optimization

#### Code Splitting
- Use React.lazy for route-based splitting
- Implement dynamic imports for large components
- Optimize bundle size with tree shaking

#### State Management
- Use Zustand for global state
- Implement proper state normalization
- Avoid unnecessary re-renders
- Use selectors for computed values

### Build and Deployment

#### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

#### Pre-commit Hooks
- ESLint for code quality
- Prettier for code formatting
- TypeScript type checking
- Unit test execution

### Debugging

#### Development Tools
- React Developer Tools
- Redux DevTools (for Zustand)
- Vite DevTools
- TypeScript Language Server

#### Common Issues
- Module path resolution
- TypeScript compilation errors
- CSS import issues
- Build optimization problems

### Contributing Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run code quality checks
4. Submit pull request
5. Code review process
6. Merge to main branch

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Generate module paths
npm run generate-module-paths

# Generate submodule paths
npm run generate-submodule-paths

# Generate card deck paths
npm run generate-carddeck-paths
```
