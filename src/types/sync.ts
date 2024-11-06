export interface SyncChange {
  type: string;
  data: Record<string, unknown>;
  timestamp?: number;
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  error: Error | null;
}

export interface OfflineSyncOptions<T = unknown> {
  key: string;
  autoSyncThreshold?: number;
  syncInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  initialData?: T;
  onSync?: (data: T) => Promise<void>;
}

export interface StorageError extends Error {
  code?: string;
  isStorageError?: boolean;
}

export interface SyncError extends Error {
  code?: string;
  isSyncError?: boolean;
  retryable?: boolean;
}

export interface OfflineSyncResult<T> {
  data: T;
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

// Mock types for testing
export interface MockTimerHandle {
  id: number;
  callback: () => void;
  delay?: number;
}

export interface MockTimerUtils {
  setImmediate: (callback: () => void) => number;
  setTimeout: (callback: () => void, delay: number) => number;
  clearImmediate: (id: number) => void;
  clearTimeout: (id: number) => void;
  runImmediates: () => void;
  runTimers: () => void;
  reset: () => void;
}
