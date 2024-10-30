import { StateCreator } from 'zustand';

// Type for store state and actions
export type StoreState<T> = T extends { getState: () => infer S } ? S : never;

// Type for mocked store hook
export interface MockStoreHook<T> extends jest.Mock {
  setState: (partial: Partial<T>) => void;
  getState: () => T;
}

// Create a mocked store state
export function createMockStoreState<T extends object>(initialState: T): T {
  return {
    ...initialState,
  };
}

// Create a mock implementation for a store hook
export function createMockStoreHook<T extends object>(initialState: T): MockStoreHook<T> {
  let state = { ...initialState };
  
  const mockFn = jest.fn(() => state) as MockStoreHook<T>;
  
  mockFn.setState = (newState: Partial<T>) => {
    state = { ...state, ...newState };
    mockFn.mockImplementation(() => state);
  };

  mockFn.getState = () => state;

  return mockFn;
}

// For backward compatibility
export const mockZustandStore = createMockStoreHook;
