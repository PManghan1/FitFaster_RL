import { useCallback, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import type { Supplement } from '../types/supplement';

interface ListRenderConfig<T> {
  keyExtractor: (item: T) => string;
  getItemLayout: (
    data: T[] | null,
    index: number
  ) => {
    length: number;
    offset: number;
    index: number;
  };
  removeClippedSubviews: boolean;
  maxToRenderPerBatch: number;
  updateCellsBatchingPeriod: number;
  windowSize: number;
  initialNumToRender: number;
}

export function useSupplementPerformance() {
  const { measurePerformance } = usePerformanceMonitoring();
  const renderCount = useRef(0);

  const deferredOperation = useCallback(async (operation: () => Promise<void>) => {
    await InteractionManager.runAfterInteractions(async () => {
      const startTime = performance.now();
      try {
        await operation();
      } finally {
        const duration = performance.now() - startTime;
        console.debug('Operation duration:', duration);
      }
    });
  }, []);

  const memoizeSupplementData = useCallback((supplements: Supplement[]) => {
    return supplements.map(supplement => ({
      ...supplement,
      formattedDosage: `${supplement.dosage} ${supplement.unit}`,
      reminderCount: supplement.reminderTimes.length,
      hasNotes: Boolean(supplement.notes),
    }));
  }, []);

  const trackRender = useCallback(
    (componentName: string) => {
      renderCount.current += 1;
      measurePerformance(`${componentName}_render_${renderCount.current}`);
    },
    [measurePerformance]
  );

  const optimizeListRender = useCallback(
    <T extends { id: string }>(
      data: T[],
      keyExtractor: (item: T) => string
    ): ListRenderConfig<T> => {
      return {
        keyExtractor,
        getItemLayout: (_data: T[] | null, index: number) => ({
          length: 100,
          offset: 100 * index,
          index,
        }),
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 50,
        windowSize: 5,
        initialNumToRender: 5,
      };
    },
    []
  );

  return {
    deferredOperation,
    memoizeSupplementData,
    trackRender,
    optimizeListRender,
  };
}
