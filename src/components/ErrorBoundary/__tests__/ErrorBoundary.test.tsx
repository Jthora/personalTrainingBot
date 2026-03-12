import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

const ThrowingChild = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>Happy child</div>;
};

describe('ErrorBoundary', () => {
  // Suppress React error boundary console noise
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary level="root">
        <div>Content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('root level shows "System Fault Detected" on error', () => {
    render(
      <ErrorBoundary level="root">
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/System Fault/i)).toBeTruthy();
    expect(screen.getByText(/Reload Console/i)).toBeTruthy();
  });

  it('route level shows "Surface Error" on error', () => {
    render(
      <ErrorBoundary level="route">
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Surface Error/i)).toBeTruthy();
    expect(screen.getByText(/Retry Surface/i)).toBeTruthy();
  });

  it('retry button resets error state at route level', () => {
    let shouldThrow = true;
    const Conditional = () => {
      if (shouldThrow) throw new Error('temp failure');
      return <div>Recovered</div>;
    };

    const { rerender } = render(
      <ErrorBoundary level="route">
        <Conditional />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Surface Error/i)).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByText(/Retry Surface/i));
    // After retry, boundary resets and re-renders children
    rerender(
      <ErrorBoundary level="route">
        <Conditional />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Recovered')).toBeTruthy();
  });
});
