import { EventEmitter } from 'events';
import { NavigationState, PartialState } from '@react-navigation/native';

// Navigation event emitter for deep link handling
const navigationEventEmitter = new EventEmitter();

// Mock navigation state
interface MockNavigationState {
  routes: Array<{
    name: string;
    params?: Record<string, unknown>;
    state?: PartialState<NavigationState>;
  }>;
  index: number;
}

class NavigationTestUtils {
  private static instance: NavigationTestUtils;
  private currentState: MockNavigationState;
  private navigationHistory: MockNavigationState[];
  private deepLinkHandlers: Map<string, (url: string) => void>;
  private timeoutDuration: number = 1000;

  private constructor() {
    this.currentState = {
      routes: [],
      index: -1,
    };
    this.navigationHistory = [];
    this.deepLinkHandlers = new Map();
  }

  static getInstance(): NavigationTestUtils {
    if (!NavigationTestUtils.instance) {
      NavigationTestUtils.instance = new NavigationTestUtils();
    }
    return NavigationTestUtils.instance;
  }

  // Navigation State Management
  getCurrentState(): MockNavigationState {
    return { ...this.currentState };
  }

  navigate(routeName: string, params?: Record<string, unknown>): void {
    this.navigationHistory.push({ ...this.currentState });

    this.currentState.routes.push({
      name: routeName,
      params,
    });
    this.currentState.index = this.currentState.routes.length - 1;

    navigationEventEmitter.emit('navigation', {
      type: 'navigate',
      routeName,
      params,
    });
  }

  goBack(): boolean {
    if (this.currentState.index > 0) {
      this.navigationHistory.push({ ...this.currentState });
      this.currentState.index--;
      navigationEventEmitter.emit('navigation', {
        type: 'goBack',
      });
      return true;
    }
    return false;
  }

  resetNavigation(state: MockNavigationState): void {
    this.navigationHistory.push({ ...this.currentState });
    this.currentState = { ...state };
    navigationEventEmitter.emit('navigation', {
      type: 'reset',
      state,
    });
  }

  // Deep Linking
  async handleDeepLink(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, this.timeoutDuration);

      const handler = this.deepLinkHandlers.get(new URL(url).pathname);
      if (handler) {
        handler(url);
        clearTimeout(timeout);
        resolve(true);
      }
    });
  }

  registerDeepLinkHandler(path: string, handler: (url: string) => void): void {
    this.deepLinkHandlers.set(path, handler);
  }

  unregisterDeepLinkHandler(path: string): void {
    this.deepLinkHandlers.delete(path);
  }

  // Navigation Testing Utilities
  verifyCurrentRoute(routeName: string, params?: Record<string, unknown>): boolean {
    const currentRoute = this.currentState.routes[this.currentState.index];
    return (
      currentRoute?.name === routeName &&
      (!params || JSON.stringify(currentRoute?.params) === JSON.stringify(params))
    );
  }

  verifyNavigationSequence(
    sequence: Array<{ name: string; params?: Record<string, unknown> }>
  ): boolean {
    if (sequence.length !== this.currentState.routes.length) return false;

    return sequence.every((expected, index) => {
      const actual = this.currentState.routes[index];
      return (
        actual.name === expected.name &&
        (!expected.params || JSON.stringify(actual.params) === JSON.stringify(expected.params))
      );
    });
  }

  getNavigationHistory(): MockNavigationState[] {
    return [...this.navigationHistory];
  }

  // Event Listeners
  addNavigationListener(
    event: string,
    listener: (event: {
      type: string;
      routeName?: string;
      params?: Record<string, unknown>;
    }) => void
  ): () => void {
    navigationEventEmitter.on(event, listener);
    return () => navigationEventEmitter.off(event, listener);
  }

  // Test Setup/Teardown
  resetState(): void {
    this.currentState = {
      routes: [],
      index: -1,
    };
    this.navigationHistory = [];
    this.deepLinkHandlers.clear();
    navigationEventEmitter.removeAllListeners();
  }

  setTimeout(duration: number): void {
    this.timeoutDuration = duration;
  }
}

// Create mock navigation object
export const createMockNavigation = () => ({
  navigate: jest.fn((routeName: string, params?: Record<string, unknown>) => {
    NavigationTestUtils.getInstance().navigate(routeName, params);
  }),
  goBack: jest.fn(() => {
    return NavigationTestUtils.getInstance().goBack();
  }),
  reset: jest.fn((state: MockNavigationState) => {
    NavigationTestUtils.getInstance().resetNavigation(state);
  }),
  getCurrentRoute: jest.fn(() => {
    const state = NavigationTestUtils.getInstance().getCurrentState();
    return state.routes[state.index];
  }),
});

// Create mock linking object
export const createMockLinking = () => ({
  addEventListener: jest.fn((event: string, handler: (url: string) => void) => {
    return NavigationTestUtils.getInstance().addNavigationListener(
      event,
      ({ type, routeName, params }) => {
        if (type === 'url' && routeName) {
          handler(
            `app://${routeName}${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`
          );
        }
      }
    );
  }),
  removeEventListener: jest.fn((event: string, handler: (url: string) => void) => {
    navigationEventEmitter.off(event, handler);
  }),
  openURL: jest.fn(async (url: string) => {
    return NavigationTestUtils.getInstance().handleDeepLink(url);
  }),
  canOpenURL: jest.fn(async () => true),
  getInitialURL: jest.fn(async () => null),
});

export const navigationTestUtils = NavigationTestUtils.getInstance();
