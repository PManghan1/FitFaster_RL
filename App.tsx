import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
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
