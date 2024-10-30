import type { PersistApi } from './middleware/persist';

// Base interface for all stores
export interface BaseStore {
  reset: () => void;
}

// Type for stores with persistence
export type StoreWithPersist<T extends BaseStore> = T & PersistApi;

// Helper type for store hooks
export type StoreHook<T extends BaseStore> = () => T;
