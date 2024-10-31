import { NavigationContainer } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import { ErrorBoundary } from './components/ErrorBoundary';
import config from './config'; // Import config
import { RootNavigator } from './navigation/RootNavigator';
import { useStoreCleanup } from './store/hooks/useStoreCleanup';
import { theme } from './theme';

// Initialize Sentry for error monitoring
Sentry.init({
  dsn: config.sentry.dsn, // Use DSN from config
  // You can add additional configuration options here
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});

export default function App() {
  // Initialize store cleanup
  useStoreCleanup();

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
