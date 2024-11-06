import '@testing-library/jest-native/extend-expect';

// Mock __DEV__ for testing
(global as any).__DEV__ = true;

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
  NativeModules: {
    UIManager: {
      RCTView: () => ({
        directEventTypes: {},
        validAttributes: {},
      }),
    },
  },
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

// Mock analytics service
jest.mock('../services/analytics', () => ({
  analyticsService: {
    trackError: jest.fn(),
  },
}));
