import { StateCreator, StoreApi } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersistOptions<T> {
  name: string;
  version?: number;
  migrate?: (persistedState: any, version: number) => T;
  blacklist?: (keyof T)[];
  whitelist?: (keyof T)[];
}

export interface PersistApi {
  clearPersistedState: () => Promise<void>;
}

type PersistMiddleware = <T extends object>(
  config: StateCreator<T, [], []>,
  options: PersistOptions<T>
) => StateCreator<T & PersistApi, [], []>;

export const persist: PersistMiddleware = <T extends object>(
  config: StateCreator<T, [], []>,
  options: PersistOptions<T>
): StateCreator<T & PersistApi, [], []> => (set, get, api) => {
  const persistKey = `store_${options.name}_v${options.version || 1}`;

  const persistState = async (state: Partial<T>) => {
    try {
      let persistedState = { ...state };
      delete (persistedState as any).clearPersistedState;

      // Handle blacklist/whitelist
      if (options.blacklist) {
        options.blacklist.forEach((key) => {
          delete persistedState[key];
        });
      } else if (options.whitelist) {
        const newState = {} as Partial<T>;
        options.whitelist.forEach((key) => {
          if (key in state) {
            newState[key] = state[key];
          }
        });
        persistedState = newState;
      }

      await AsyncStorage.setItem(persistKey, JSON.stringify({
        state: persistedState,
        version: options.version || 1,
      }));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  };

  const loadPersistedState = async (): Promise<Partial<T> | null> => {
    try {
      const savedState = await AsyncStorage.getItem(persistKey);
      if (savedState) {
        const { state, version } = JSON.parse(savedState);
        
        if (options.migrate && version !== options.version) {
          return options.migrate(state, version);
        }
        
        return state;
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
    return null;
  };

  const clearPersistedState = async () => {
    try {
      await AsyncStorage.removeItem(persistKey);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  };

  // Create the base store
  const baseStore = config((nextState) => {
    const mergedState = typeof nextState === 'function'
      ? { ...get(), ...nextState(get() as T) }
      : { ...get(), ...nextState };

    set(mergedState as T & PersistApi);
    persistState(mergedState);
  }, get as () => T, api);

  // Create the store with persistence
  const persistedStore: T & PersistApi = {
    ...baseStore,
    clearPersistedState,
  };

  // Load persisted state
  loadPersistedState().then((savedState) => {
    if (savedState) {
      set({ ...savedState, clearPersistedState } as T & PersistApi);
    } else {
      set(persistedStore);
    }
  });

  return persistedStore;
};
