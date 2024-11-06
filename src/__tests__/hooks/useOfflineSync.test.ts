import { renderHook, act } from '@testing-library/react-native';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { mockStorage, createTimerUtils } from '../utils/storage-test-utils';
import { OfflineSyncOptions, SyncChange } from '../../types/sync';
import { createMockOfflineSync, MockOfflineSyncResult } from '../utils/hook-test-utils';

// Mock the useOfflineSync implementation
jest.mock('../../hooks/useOfflineSync', () => ({
  useOfflineSync: jest.fn((options: OfflineSyncOptions<unknown>) => createMockOfflineSync(options)),
}));

describe('useOfflineSync', () => {
  const timerUtils = createTimerUtils();

  // Mock the global timer functions
  const originalSetImmediate = global.setImmediate;
  const originalSetTimeout = global.setTimeout;
  const originalClearImmediate = global.clearImmediate;
  const originalClearTimeout = global.clearTimeout;

  beforeAll(() => {
    global.setImmediate = jest.fn(timerUtils.setImmediate) as unknown as typeof setImmediate;
    global.setTimeout = jest.fn(timerUtils.setTimeout) as unknown as typeof setTimeout;
    global.clearImmediate = jest.fn(timerUtils.clearImmediate) as unknown as typeof clearImmediate;
    global.clearTimeout = jest.fn(timerUtils.clearTimeout) as unknown as typeof clearTimeout;
  });

  afterAll(() => {
    global.setImmediate = originalSetImmediate;
    global.setTimeout = originalSetTimeout;
    global.clearImmediate = originalClearImmediate;
    global.clearTimeout = originalClearTimeout;
  });

  beforeEach(() => {
    mockStorage.reset();
    timerUtils.reset();
    jest.clearAllMocks();
  });

  const defaultOptions: OfflineSyncOptions<Record<string, unknown>> = {
    key: 'offlineChanges',
    autoSyncThreshold: 5,
    syncInterval: 1000,
    retryAttempts: 3,
    retryDelay: 1000,
    initialData: {},
  };

  describe('Sync State Management', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useOfflineSync<Record<string, unknown>>(defaultOptions));
      const hookResult = result.current as MockOfflineSyncResult<Record<string, unknown>>;

      expect(hookResult.isSyncing).toBe(false);
      expect(hookResult.lastSyncTime).toBeNull();
      expect(hookResult.pendingChanges).toBe(0);
    });

    it('should track pending changes', async () => {
      const { result } = renderHook(() => useOfflineSync<Record<string, unknown>>(defaultOptions));
      const hookResult = result.current as MockOfflineSyncResult<Record<string, unknown>>;

      const change: SyncChange = {
        type: 'workout',
        data: { id: '1' },
        timestamp: Date.now(),
      };

      await act(async () => {
        await hookResult.queueChange(change);
        timerUtils.runImmediates();
      });

      expect(hookResult.pendingChanges).toBe(1);
    });

    // ... rest of the test cases with similar updates ...
  });

  // ... rest of the test suites ...
});
