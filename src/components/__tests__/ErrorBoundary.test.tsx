import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

// A component that always throws
function ThrowingComponent(): JSX.Element {
  throw new Error('Test error');
}

// A component that renders normally
function SafeComponent() {
  return <div>Safe content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeDefined();
  });

  it('renders fallback UI when a child throws', () => {
    // Suppress console.error for the expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Test error')).toBeDefined();
    expect(screen.getByText('Return to Home')).toBeDefined();

    consoleSpy.mockRestore();
  });
});
