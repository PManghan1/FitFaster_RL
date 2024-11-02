import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from '../services/sync';
import { createLogger } from '../utils/logger';

const logger = createLogger('useOfflineSync');

export type OfflineSyncOptions<T> = {
  key: string;
  initialData?: T;
  onSync?: (data: T) => Promise<void>;
  validateData?: (data: T) => boolean;
};

export function useOfflineSync<T>({
  key,
  initialData,
  onSync,
  validateData,
}: OfflineSyncOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  // Load data from local storage
  useEffect(() => {
    const loadData = async () => {
      if (initialData) {
        return; // Skip loading if initialData is provided
      }

      try {
        const storedData = await AsyncStorage.getItem(`@offline_${key}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData) as T;
          if (!validateData || validateData(parsedData)) {
            setData(parsedData);
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load offline data');
        logger.error(`Failed to load offline data for ${key}`, error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [key, validateData, initialData]);

  // Save data to local storage and queue sync
  const updateData = useCallback(
    async (newData: T) => {
      setError(null); // Clear previous errors
      try {
        // Validate data if validator is provided
        if (validateData && !validateData(newData)) {
          throw new Error('Invalid data format');
        }

        // Update local state
        setData(newData);

        // Save to AsyncStorage
        await AsyncStorage.setItem(`@offline_${key}`, JSON.stringify(newData));

        // Queue sync action
        if (onSync) {
          await syncService.queueAction({
            type: 'UPDATE',
            table: key,
            data: newData as unknown as Record<string, unknown>,
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update offline data');
        logger.error(`Failed to update offline data for ${key}`, error);
        setError(error);
        throw error;
      }
    },
    [key, onSync, validateData]
  );

  // Clear offline data
  const clearData = useCallback(async () => {
    setError(null); // Clear previous errors
    try {
      await AsyncStorage.removeItem(`@offline_${key}`);
      setData(undefined);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear offline data');
      logger.error(`Failed to clear offline data for ${key}`, error);
      setError(error);
      throw error;
    }
  }, [key]);

  // Force sync
  const sync = useCallback(async () => {
    if (!data || !onSync) return;

    setError(null); // Clear previous errors
    try {
      await onSync(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync data');
      logger.error(`Failed to sync data for ${key}`, error);
      setError(error);
      throw error;
    }
  }, [data, key, onSync]);

  return {
    data,
    isLoading,
    error,
    updateData,
    clearData,
    sync,
  };
}
