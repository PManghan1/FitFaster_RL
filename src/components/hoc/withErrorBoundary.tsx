import React from 'react';

import { ErrorBoundary } from '../ErrorBoundary';

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param WrappedComponent The component to wrap
 * @param options Optional configuration for the error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  } = {},
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={options.fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}
