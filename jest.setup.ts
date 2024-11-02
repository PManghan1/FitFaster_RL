import '@testing-library/jest-native/extend-expect';

// Mock the expo-constants module
jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      supabaseUrl: 'mock-url',
      supabaseAnonKey: 'mock-key',
    },
  },
}));

// Mock the react-native-reanimated module
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
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

// Set up global mocks
global.fetch = jest.fn();
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.resetAllMocks();
});
