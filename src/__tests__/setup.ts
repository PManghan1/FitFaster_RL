import '@testing-library/jest-native/extend-expect';
import Reanimated from 'react-native-reanimated/mock';

interface MockPerformance {
  now: jest.Mock;
  mark: jest.Mock;
  measure: jest.Mock;
  clearMarks: jest.Mock;
  clearMeasures: jest.Mock;
  getEntriesByName: jest.Mock;
  getEntriesByType: jest.Mock;
  getEntries: jest.Mock;
}

// Mock only the performance methods we actually use
const mockPerformance: MockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  getEntries: jest.fn(() => []),
};

// Set up performance mock
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock the react-native-reanimated module
jest.mock('react-native-reanimated', () => {
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock the expo-secure-store module
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock the @sentry/react-native module
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn(),
}));

// Mock the expo-constants module
jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      supabaseUrl: 'mock-url',
      supabaseAnonKey: 'mock-key',
    },
  },
}));

// Set up global mocks
Object.defineProperty(global, 'fetch', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(global, 'console', {
  value: {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
  },
  writable: true,
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.resetAllMocks();
});
