import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStoreCleanup } from './src/store/hooks/useStoreCleanup';

export default function App() {
  // Initialize store cleanup
  useStoreCleanup();

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
