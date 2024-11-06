import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export function useConnectionAlert() {
  const netInfo = useNetInfo();

  const checkConnection = useCallback(
    async (action: () => Promise<void>) => {
      if (!netInfo.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      try {
        await action();
      } catch (error) {
        Alert.alert(
          'Connection Error',
          'Unable to complete action. Please check your connection and try again.',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    },
    [netInfo.isConnected]
  );

  return { checkConnection };
}
