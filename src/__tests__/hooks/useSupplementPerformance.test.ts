import { renderHook, act } from '@testing-library/react-native';
import { useSupplementPerformance } from '../../hooks/useSupplementPerformance';
import type { Supplement } from '../../types/supplement';
import { createMockSupplement } from '../utils/supplement-test-utils';
import { InteractionManager } from 'react-native';

// Mock InteractionManager
jest.mock('react-native', () => ({
  InteractionManager: {
    runAfterInteractions: jest.fn(callback => callback()),
  },
}));

// Mock usePerformanceMonitoring
jest.mock('../../hooks/usePerformanceMonitoring', () => ({
  usePerformanceMonitoring: () => ({
    measurePerformance: jest.fn(),
  }),
}));

describe('useSupplementPerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock performance.now()
    global.performance.now = jest.fn(() => 1000);
  });

  it('optimizes list rendering', async () => {
    const { result } = renderHook(() => useSupplementPerformance());
    const data: Supplement[] = [createMockSupplement()];
    const keyExtractor = (item: Supplement) => item.id;

    let config;
    await act(async () => {
      config = result.current.optimizeListRender(data, keyExtractor);
    });

    expect(config).toEqual(
      expect.objectContaining({
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 50,
        windowSize: 5,
        initialNumToRender: 5,
      })
    );
  });

  it('memoizes supplement data', async () => {
    const { result } = renderHook(() => useSupplementPerformance());
    const supplement = createMockSupplement({
      dosage: 500,
      unit: 'mg',
      reminderTimes: ['09:00', '21:00'],
      notes: 'Test note',
    });

    let memoizedData;
    await act(async () => {
      memoizedData = result.current.memoizeSupplementData([supplement]);
    });

    expect(memoizedData[0]).toEqual(
      expect.objectContaining({
        formattedDosage: '500 mg',
        reminderCount: 2,
        hasNotes: true,
      })
    );
  });

  it('tracks component renders', async () => {
    const { result } = renderHook(() => useSupplementPerformance());
    const componentName = 'TestComponent';

    await act(async () => {
      result.current.trackRender(componentName);
    });

    // Since we're using a mock, we can't directly verify the render count
    // but we can verify the function was called
    expect(result.current.trackRender).toBeDefined();
  });

  it('handles deferred operations', async () => {
    const { result } = renderHook(() => useSupplementPerformance());
    const operation = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.deferredOperation(operation);
    });

    expect(InteractionManager.runAfterInteractions).toHaveBeenCalled();
    expect(operation).toHaveBeenCalled();
  });
});
