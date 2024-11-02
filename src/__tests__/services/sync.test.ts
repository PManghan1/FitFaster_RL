import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { syncService } from '../../services/sync';
import { supabase } from '../../services/supabase';
import { asSyncServiceWithPrivateMembers, SyncServicePrivateMembers } from '../utils/test-types';

jest.mock('@react-native-community/netinfo');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/supabase');

describe('SyncService', () => {
  let netInfoCallback: (state: { isConnected: boolean | null }) => void;
  let testableSync: SyncServicePrivateMembers;

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
      netInfoCallback = callback;
      return () => {};
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    testableSync = asSyncServiceWithPrivateMembers(syncService);
  });

  describe('Initialization', () => {
    it('loads queued actions from storage on initialization', async () => {
      const mockQueue = [
        {
          id: '1',
          type: 'CREATE',
          table: 'test',
          data: { name: 'test' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockQueue));

      testableSync.actionQueue = [];
      await testableSync.initialize();

      expect(testableSync.actionQueue).toEqual(mockQueue);
    });

    it('handles storage errors gracefully', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

      testableSync.actionQueue = [];
      await testableSync.initialize();

      expect(testableSync.actionQueue).toEqual([]);
    });
  });

  describe('Action Queueing', () => {
    it('queues an action and saves to storage', async () => {
      const action = {
        type: 'CREATE' as const,
        table: 'test',
        data: { name: 'test' },
      };

      await syncService.queueAction(action);

      expect(testableSync.actionQueue.length).toBe(1);
      expect(testableSync.actionQueue[0]).toMatchObject(action);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('processes queued actions when online', async () => {
      const action = {
        type: 'CREATE' as const,
        table: 'test',
        data: { name: 'test' },
      };

      // Mock online state
      testableSync.state.isOnline = true;
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      await syncService.queueAction(action);

      expect(testableSync.actionQueue.length).toBe(0);
      expect(supabase.from).toHaveBeenCalledWith('test');
    });
  });

  describe('Network State Changes', () => {
    it('processes pending actions when coming online', async () => {
      const action = {
        id: '1',
        type: 'CREATE' as const,
        table: 'test',
        data: { name: 'test' },
        timestamp: Date.now(),
        retryCount: 0,
      };

      testableSync.actionQueue = [action];
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Simulate going offline then online
      netInfoCallback({ isConnected: false });
      netInfoCallback({ isConnected: true });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(testableSync.actionQueue.length).toBe(0);
      expect(supabase.from).toHaveBeenCalledWith('test');
    });
  });

  describe('Conflict Resolution', () => {
    it('handles update conflicts with server-wins strategy', async () => {
      const action = {
        id: '1',
        type: 'UPDATE' as const,
        table: 'test',
        data: {
          id: '123',
          name: 'test',
          updated_at: new Date(Date.now() - 1000).toISOString(),
        },
        timestamp: Date.now(),
        retryCount: 0,
      };

      // Mock server having newer data
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '123',
                name: 'server-value',
                updated_at: new Date().toISOString(),
              },
            }),
          }),
        }),
      });

      await expect(testableSync.handleUpdate('test', action.data)).rejects.toThrow(
        'Conflict: Server has newer data'
      );
    });
  });

  describe('Error Handling and Retries', () => {
    it('retries failed actions up to 3 times', async () => {
      const action = {
        id: '1',
        type: 'CREATE' as const,
        table: 'test',
        data: { name: 'test' },
        timestamp: Date.now(),
        retryCount: 0,
      };

      // Mock a failing operation
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockRejectedValue(new Error('Network error')),
      });

      testableSync.actionQueue = [action];
      await testableSync.processPendingActions();

      expect(testableSync.actionQueue[0].retryCount).toBe(1);
    });

    it('moves action to failed storage after 3 retries', async () => {
      const action = {
        id: '1',
        type: 'CREATE' as const,
        table: 'test',
        data: { name: 'test' },
        timestamp: Date.now(),
        retryCount: 3,
      };

      // Mock a failing operation
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockRejectedValue(new Error('Network error')),
      });

      testableSync.actionQueue = [action];
      await testableSync.processPendingActions();

      expect(testableSync.actionQueue.length).toBe(0);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^@sync_failed_/),
        expect.any(String)
      );
    });
  });

  describe('State Management', () => {
    it('notifies subscribers of state changes', () => {
      const subscriber = jest.fn();
      syncService.subscribe(subscriber);

      testableSync.updateState({ isOnline: false });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          isOnline: false,
        })
      );
    });

    it('allows unsubscribing from state changes', () => {
      const subscriber = jest.fn();
      const unsubscribe = syncService.subscribe(subscriber);

      unsubscribe();

      testableSync.updateState({ isOnline: false });

      expect(subscriber).toHaveBeenCalledTimes(1); // Only the initial call
    });
  });
});
