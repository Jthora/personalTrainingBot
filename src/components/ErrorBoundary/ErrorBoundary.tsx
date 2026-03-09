import React from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  level: 'root' | 'route';
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.level}]`, error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isRoot = this.props.level === 'root';

    return (
      <div className={styles.container} role="alert">
        <div className={styles.card}>
          <h2 className={styles.title}>
            {isRoot ? 'System Fault Detected' : 'Surface Error'}
          </h2>
          <p className={styles.message}>
            {isRoot
              ? 'The console encountered an unrecoverable error. Reload to restore operations.'
              : 'This mission surface encountered an error. You can retry or navigate to another surface.'}
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className={styles.details}>{this.state.error.message}</pre>
          )}
          <div className={styles.actions}>
            {!isRoot && (
              <button className={styles.retryButton} onClick={this.handleRetry}>
                Retry Surface
              </button>
            )}
            <button className={styles.reloadButton} onClick={this.handleReload}>
              Reload Console
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
