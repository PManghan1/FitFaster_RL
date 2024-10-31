import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStoreCleanup } from './src/store/hooks/useStoreCleanup';
import { theme } from './theme';

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
