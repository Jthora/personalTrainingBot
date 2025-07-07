# Component Documentation

## Overview

This document provides detailed information about the React components used in the Personal Training Bot application.

## Component Architecture

### Component Categories

#### Layout Components
- **Header** - Main navigation and branding
- **Sidebar** - Navigation menu for different sections
- **LoadingMessage** - Global loading indicator

#### Page Components
- **HomePage** - Landing page with overview
- **WorkoutsPage** - Workout management interface
- **TrainingPage** - Training module interface
- **SchedulesPage** - Schedule management
- **SettingsPage** - Application settings

#### Core Training Components
- **TrainingWindow** - Main training interface
- **TrainingSequence** - Training progression logic
- **CardTable** - Card display and interaction
- **CardSelector** - Card selection interface
- **WorkoutCard** - Individual workout display

#### Schedule Components
- **SchedulesSidebar** - Schedule navigation
- **SchedulesWindow** - Schedule management interface
- **WorkoutScheduler** - Schedule creation tool
- **WorkoutTimer** - Timer functionality

#### Settings Components
- **SettingsPanel** - Main settings interface
- **SettingsSidebar** - Settings navigation
- **DifficultySettings** - Difficulty configuration
- **SoundSettings** - Audio preferences

## Component Details

### TrainingWindow
**Location**: `src/components/TrainingWindow/`
**Purpose**: Main training interface container

```typescript
interface TrainingWindowProps {
  moduleId: string;
  subModuleId?: string;
  cardDeckId?: string;
}
```

**Features**:
- Dynamic module loading
- Progress tracking
- Card navigation
- Timer integration
- Score calculation

### CardTable
**Location**: `src/components/CardTable/`
**Purpose**: Interactive card display and management

```typescript
interface CardTableProps {
  cards: Card[];
  selectedCardId?: string;
  onCardSelect: (cardId: string) => void;
  difficulty: DifficultyLevel;
}
```

**Features**:
- Card shuffling
- Difficulty-based display
- Interactive card selection
- Animation effects
- Progress indicators

### WorkoutScheduler
**Location**: `src/components/WorkoutScheduler/`
**Purpose**: Schedule creation and management

```typescript
interface WorkoutSchedulerProps {
  schedules: WorkoutSchedule[];
  onScheduleCreate: (schedule: WorkoutSchedule) => void;
  onScheduleUpdate: (schedule: WorkoutSchedule) => void;
  onScheduleDelete: (scheduleId: string) => void;
}
```

**Features**:
- Drag-and-drop scheduling
- Time block management
- Workout selection
- Calendar integration
- Schedule templates

### DifficultySettings
**Location**: `src/components/DifficultySettings/`
**Purpose**: Training difficulty configuration

```typescript
interface DifficultySettingsProps {
  settings: DifficultySettings;
  onSettingsChange: (settings: DifficultySettings) => void;
}
```

**Features**:
- Difficulty level adjustment
- Time limit configuration
- Point multiplier settings
- Hint allowance settings
- Preview mode

## Component Patterns

### Higher-Order Components
- **withTimer** - Adds timer functionality
- **withLoading** - Adds loading states
- **withErrorBoundary** - Adds error handling

### Custom Hooks
- **useTrainingData** - Training data management
- **useWorkoutSchedule** - Schedule management
- **useSettings** - Settings management
- **useTimer** - Timer functionality
- **useAudio** - Audio management

### Context Providers
- **WorkoutScheduleProvider** - Schedule state management
- **SettingsProvider** - Settings state management
- **CardProvider** - Card state management

## Component Guidelines

### Props Interface
Each component should have a well-defined props interface:
```typescript
interface ComponentProps {
  // Required props
  data: DataType;
  onAction: (param: string) => void;
  
  // Optional props
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  
  // Children (if applicable)
  children?: React.ReactNode;
}
```

### State Management
- Use local state for component-specific data
- Use Zustand stores for global state
- Implement proper state updates
- Handle loading and error states

### Error Handling
- Implement error boundaries
- Handle async operation errors
- Provide user-friendly error messages
- Log errors for debugging

### Performance Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays
- Use useMemo for expensive calculations
- Implement virtual scrolling for large lists

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Component Testing

### Unit Tests
```typescript
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const mockHandler = jest.fn();
    render(<ComponentName onAction={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledWith('expected-param');
  });
});
```

### Integration Tests
- Test component interactions
- Verify data flow
- Test user workflows
- Validate API integrations

## Component Styling

### CSS Modules
Each component uses CSS modules for styling:
```css
/* ComponentName.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}
```

### Style Variables
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  --font-family-sans: 'Inter', sans-serif;
  --font-family-mono: 'Roboto Mono', monospace;
  
  --border-radius: 0.375rem;
  --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
```

### Responsive Design
- Mobile-first approach
- Flexible layouts
- Touch-friendly interfaces
- Appropriate breakpoints

## Common Patterns

### Loading States
```typescript
if (loading) {
  return <LoadingMessage message="Loading training data..." />;
}
```

### Error States
```typescript
if (error) {
  return <ErrorMessage message={error.message} onRetry={handleRetry} />;
}
```

### Conditional Rendering
```typescript
{isAuthenticated && <UserMenu />}
{selectedCard && <CardDetails card={selectedCard} />}
```

### Event Handling
```typescript
const handleClick = useCallback((id: string) => {
  onItemSelect(id);
}, [onItemSelect]);
```
