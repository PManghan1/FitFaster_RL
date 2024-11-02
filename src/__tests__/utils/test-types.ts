import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ParamListBase } from '@react-navigation/native';
import type { SyncAction, SyncState } from '../../services/sync';

export type MockNavigationProps<T extends ParamListBase> = {
  [K in keyof NativeStackNavigationProp<T>]: jest.Mock;
};

export function createMockNavigation<T extends ParamListBase>(): MockNavigationProps<T> {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(),
    canGoBack: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    addListener: jest.fn(() => () => {}),
    removeListener: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
  } as MockNavigationProps<T>;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P];
};

// Type for accessing private members of SyncService in tests
export type SyncServicePrivateMembers = {
  actionQueue: SyncAction[];
  state: SyncState;
  subscribers: Set<(state: SyncState) => void>;
  initialize(): Promise<void>;
  loadQueue(): Promise<void>;
  saveQueue(): Promise<void>;
  updateState(newState: Partial<SyncState>): void;
  notifySubscribers(): void;
  processPendingActions(): Promise<void>;
  processAction(action: SyncAction): Promise<void>;
  handleCreate(table: string, data: Record<string, unknown>): Promise<void>;
  handleUpdate(table: string, data: { id: string; [key: string]: unknown }): Promise<void>;
  handleDelete(table: string, data: { id: string; [key: string]: unknown }): Promise<void>;
  isRecordWithId(data: unknown): data is { id: string; [key: string]: unknown };
};

// Type assertion function for testing
export function asSyncServiceWithPrivateMembers(service: unknown): SyncServicePrivateMembers {
  return service as SyncServicePrivateMembers;
}
