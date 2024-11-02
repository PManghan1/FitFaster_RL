import React, { Component, ErrorInfo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ErrorCategory, errorReporting, ErrorSeverity } from '../services/error';
import { theme } from '../theme';
import { PerformanceMonitor } from '../utils/performance';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private readonly MAX_RETRIES = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const category = errorReporting.categorizeError(error);
    const severity = errorReporting.determineSeverity(error, category);

    return {
      hasError: true,
      error,
      category,
      severity,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    PerformanceMonitor.start('error-handling');

    this.setState({ errorInfo });

    // Report error to our error service
    await errorReporting.reportError({
      error,
      errorInfo,
      severity: this.state.severity,
      category: this.state.category,
      timestamp: Date.now(),
      componentStack: errorInfo.componentStack || undefined,
      additionalData: {
        retryCount: this.state.retryCount,
      },
    });

    const duration = PerformanceMonitor.end('error-handling');
    if (duration > 100) {
      console.warn(`Slow error handling detected: ${duration}ms`);
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.MAX_RETRIES) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryCount: 0,
    });
  };

  private renderErrorDetails() {
    const { error, category, severity } = this.state;
    const isRecoverable = error ? errorReporting.isRecoverable(error) : false;
    const userMessage = errorReporting.getUserFriendlyMessage(category, severity);
    const recoveryAction = errorReporting.getRecoveryAction(category);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>

        <Text style={styles.message}>{userMessage}</Text>

        <Text style={styles.action}>{recoveryAction}</Text>

        {__DEV__ && error && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Information:</Text>
            <Text style={styles.debugText}>{error.message}</Text>
            <Text style={styles.debugText}>Category: {category}</Text>
            <Text style={styles.debugText}>Severity: {severity}</Text>
          </View>
        )}

        {isRecoverable && this.state.retryCount < this.MAX_RETRIES && (
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={this.handleReset}>
          <Text style={styles.buttonText}>Reset App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return this.renderErrorDetails();
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  action: {
    color: theme.colors.text.light,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary.default,
    borderRadius: 8,
    marginTop: 20,
    padding: 12,
    width: '80%',
  },
  buttonText: {
    color: theme.colors.background.default,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  debugContainer: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    marginTop: 20,
    padding: 16,
    width: '100%',
  },
  debugText: {
    color: theme.colors.text.light,
    fontSize: 12,
    marginTop: 4,
  },
  debugTitle: {
    color: theme.colors.text.default,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    color: theme.colors.text.default,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: theme.colors.error.default,
  },
  title: {
    color: theme.colors.text.default,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
