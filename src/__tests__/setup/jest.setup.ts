import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// React Native Core Mocks
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Third-party Package Mocks
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Expo Package Mocks
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  cancelAuthenticate: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://document-directory/',
  cacheDirectory: 'file://cache-directory/',
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  moveAsync: jest.fn(),
  getFreeDiskStorageAsync: jest.fn(),
}));

// Navigation Mocks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Zustand Mock Setup
jest.mock('zustand', () => ({
  create: jest.fn(createState => {
    const store = createState(() => ({}));
    return () => store;
  }),
}));

// Console Handling
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: any[]) => {
  if (
    args[0]?.includes?.('Please update the following components:') ||
    args[0]?.includes?.('ViewPropTypes will be removed') ||
    args[0]?.includes?.('AsyncStorage has been extracted')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args: any[]) => {
  if (
    args[0]?.includes?.('Error: Uncaught [Error: ') ||
    args[0]?.startsWith?.('[React Intl]') ||
    args[0]?.includes?.('act(...)')
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Global Timing APIs
global.requestAnimationFrame = function (callback: FrameRequestCallback): number {
  return +setTimeout(() => callback(Date.now()), 0);
};

global.cancelAnimationFrame = function (handle: number): void {
  clearTimeout(handle);
};

// Fetch Mock
global.fetch = jest.fn();

// Dimensions Mock
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Test Environment Setup
beforeAll(() => {
  // Reset all mocks before each test suite
  jest.clearAllMocks();

  // Set up default timezone for consistent date handling
  process.env.TZ = 'UTC';
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllTimers();
});
