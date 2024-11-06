import { SyncChange, OfflineSyncOptions } from '../../types/sync';

export interface MockOfflineSyncResult<T> {
  data: T | null;
  isSyncing: boolean;
  isLoading: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  error: Error | null;
  queueChange: (change: SyncChange) => Promise<void>;
  sync: () => Promise<void>;
  updateData: (newData: T) => Promise<void>;
  clearData: () => Promise<void>;
}

export const createMockOfflineSync = <T>(
  options: OfflineSyncOptions<T>
): MockOfflineSyncResult<T> => {
  let currentData: T | null = options.initialData ?? null;
  const syncState = {
    isSyncing: false,
    isLoading: false,
    lastSyncTime: null as number | null,
    pendingChanges: 0,
    error: null as Error | null,
  };

  return {
    get data() {
      return currentData;
    },
    get isSyncing() {
      return syncState.isSyncing;
    },
    get isLoading() {
      return syncState.isLoading;
    },
    get lastSyncTime() {
      return syncState.lastSyncTime;
    },
    get pendingChanges() {
      return syncState.pendingChanges;
    },
    get error() {
      return syncState.error;
    },
    async queueChange(change: SyncChange) {
      syncState.pendingChanges++;
      // Simulate auto-sync if threshold is reached
      if (options.autoSyncThreshold && syncState.pendingChanges >= options.autoSyncThreshold) {
        await this.sync();
      }
    },
    async sync() {
      syncState.isSyncing = true;
      try {
        syncState.pendingChanges = 0;
        syncState.lastSyncTime = Date.now();
      } finally {
        syncState.isSyncing = false;
      }
    },
    async updateData(newData: T) {
      currentData = newData;
    },
    async clearData() {
      currentData = null;
      syncState.pendingChanges = 0;
    },
  };
};
