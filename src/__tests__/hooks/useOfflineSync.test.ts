import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { syncService } from '../../services/sync';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock sync service
jest.mock('../../services/sync', () => ({
  syncService: {
    queueAction: jest.fn(),
  },
}));

interface TestData {
  id: string;
  value: string;
}

describe('useOfflineSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct loading state', () => {
    const { result: withoutInitial } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
      })
    );
    expect(withoutInitial.current.isLoading).toBe(true);

    const { result: withInitial } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        initialData: { id: '1', value: 'test' },
      })
    );
    expect(withInitial.current.isLoading).toBe(false);
  });

  it('loads initial data from storage', async () => {
    const mockData: TestData = { id: '1', value: 'test' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
      })
    );

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('validates data before setting it', async () => {
    const mockData: TestData = { id: '1', value: 'test' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

    const validateData = jest.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        validateData,
      })
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
    });

    expect(validateData).toHaveBeenCalledWith(mockData);
    expect(result.current.data).toBeUndefined();
  });

  it('updates data and queues sync action', async () => {
    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        initialData: { id: '1', value: 'initial' },
        onSync: jest.fn(),
      })
    );

    const newData: TestData = { id: '1', value: 'updated' };

    await act(async () => {
      await result.current.updateData(newData);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@offline_testKey', JSON.stringify(newData));
    expect(syncService.queueAction).toHaveBeenCalledWith({
      type: 'UPDATE',
      table: 'testKey',
      data: newData,
    });
    expect(result.current.data).toEqual(newData);
    expect(result.current.error).toBeNull();
  });

  it('handles validation error during update', async () => {
    const validateData = jest.fn().mockReturnValue(false);
    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        validateData,
      })
    );

    await act(async () => {
      try {
        await result.current.updateData({ id: '1', value: 'invalid' });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid data format');
      }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('clears data from storage', async () => {
    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        initialData: { id: '1', value: 'test' },
      })
    );

    await act(async () => {
      await result.current.clearData();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@offline_testKey');
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('handles storage errors gracefully', async () => {
    const error = new Error('Storage error');
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
      })
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('syncs data when requested', async () => {
    const mockData: TestData = { id: '1', value: 'test' };
    const onSync = jest.fn().mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        initialData: mockData,
        onSync,
      })
    );

    await act(async () => {
      await result.current.sync();
    });

    expect(onSync).toHaveBeenCalledWith(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles sync errors', async () => {
    const mockData: TestData = { id: '1', value: 'test' };
    const error = new Error('Sync failed');
    const onSync = jest.fn().mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
        initialData: mockData,
        onSync,
      })
    );

    await act(async () => {
      try {
        await result.current.sync();
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(result.current.error).toEqual(error);
  });

  it('skips sync when no data or onSync handler', async () => {
    const { result } = renderHook(() =>
      useOfflineSync<TestData>({
        key: 'testKey',
      })
    );

    await act(async () => {
      await result.current.sync();
    });

    expect(result.current.error).toBeNull();
  });
});
