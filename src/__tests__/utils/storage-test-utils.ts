interface StorageState {
  data: Record<string, string>;
  isAvailable: boolean;
  shouldSimulateError: boolean;
  errorMessage?: string;
}

class MockStorage {
  private static instance: MockStorage;
  private state: StorageState;

  private constructor() {
    this.state = {
      data: {},
      isAvailable: true,
      shouldSimulateError: false,
    };
  }

  static getInstance(): MockStorage {
    if (!MockStorage.instance) {
      MockStorage.instance = new MockStorage();
    }
    return MockStorage.instance;
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.state.isAvailable) {
      throw new Error('Storage is not available');
    }
    if (this.state.shouldSimulateError) {
      throw new Error(this.state.errorMessage || 'Storage error');
    }
    return this.state.data[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.state.isAvailable) {
      throw new Error('Storage is not available');
    }
    if (this.state.shouldSimulateError) {
      throw new Error(this.state.errorMessage || 'Storage error');
    }
    this.state.data[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    if (!this.state.isAvailable) {
      throw new Error('Storage is not available');
    }
    if (this.state.shouldSimulateError) {
      throw new Error(this.state.errorMessage || 'Storage error');
    }
    delete this.state.data[key];
  }

  // Test utilities
  setAvailability(isAvailable: boolean): void {
    this.state.isAvailable = isAvailable;
  }

  simulateError(shouldSimulate: boolean, message?: string): void {
    this.state.shouldSimulateError = shouldSimulate;
    this.state.errorMessage = message;
  }

  getStorageState(): StorageState {
    return { ...this.state };
  }

  verifyStorageOperation(key: string, expectedValue?: string): boolean {
    if (expectedValue === undefined) {
      return !(key in this.state.data);
    }
    return this.state.data[key] === expectedValue;
  }

  reset(): void {
    this.state = {
      data: {},
      isAvailable: true,
      shouldSimulateError: false,
    };
  }
}

export const mockStorage = MockStorage.getInstance();

// Timer mock utilities
export const createTimerUtils = () => {
  let immediateCallbacks: Array<() => void> = [];
  let timeoutCallbacks: Array<{ callback: () => void; delay: number }> = [];

  return {
    setImmediate: (callback: () => void) => {
      immediateCallbacks.push(callback);
      return immediateCallbacks.length;
    },

    setTimeout: (callback: () => void, delay: number) => {
      timeoutCallbacks.push({ callback, delay });
      return timeoutCallbacks.length;
    },

    clearImmediate: (id: number) => {
      if (id <= immediateCallbacks.length) {
        immediateCallbacks[id - 1] = () => {};
      }
    },

    clearTimeout: (id: number) => {
      if (id <= timeoutCallbacks.length) {
        timeoutCallbacks[id - 1] = { callback: () => {}, delay: 0 };
      }
    },

    runImmediates: () => {
      const callbacks = [...immediateCallbacks];
      immediateCallbacks = [];
      callbacks.forEach(callback => callback());
    },

    runTimers: () => {
      const callbacks = [...timeoutCallbacks];
      timeoutCallbacks = [];
      callbacks.forEach(({ callback }) => callback());
    },

    reset: () => {
      immediateCallbacks = [];
      timeoutCallbacks = [];
    },
  };
};

export type TimerUtils = ReturnType<typeof createTimerUtils>;
