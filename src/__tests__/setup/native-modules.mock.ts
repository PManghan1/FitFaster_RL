import { Platform } from 'react-native';

// Mock AsyncStorage with TypeScript types
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  flushGetRequests: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
};

// Mock Linking with TypeScript types
export const mockLinking = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
  createURL: jest.fn(),
  parse: jest.fn(),
};

// Mock Platform with TypeScript types
export const mockPlatform = {
  ...Platform,
  OS: 'ios',
  Version: 14,
  select: (obj: Record<string, any>) => obj.ios,
  constants: {
    reactNativeVersion: {
      major: 0,
      minor: 70,
      patch: 0,
    },
  },
};

// Mock Dimensions with TypeScript types
export const mockDimensions = {
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  }),
  set: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock Appearance with TypeScript types
export const mockAppearance = {
  getColorScheme: jest.fn().mockReturnValue('light'),
  addChangeListener: jest.fn(),
  removeChangeListener: jest.fn(),
  setColorScheme: jest.fn(),
};

// Mock Reanimated with TypeScript types
export const mockReanimated = {
  useAnimatedStyle: jest.fn().mockReturnValue({}),
  withTiming: jest.fn().mockImplementation(toValue => toValue),
  withSpring: jest.fn().mockImplementation(toValue => toValue),
  withSequence: jest.fn(),
  withDelay: jest.fn(),
  useSharedValue: jest.fn().mockImplementation(initial => ({
    value: initial,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  useDerivedValue: jest.fn().mockImplementation(fn => ({
    value: fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  interpolate: jest.fn(),
  Extrapolate: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
  withRepeat: jest.fn(),
  cancelAnimation: jest.fn(),
  runOnJS: jest.fn().mockImplementation(fn => fn),
  measure: jest.fn(),
  withDecay: jest.fn(),
  useAnimatedGestureHandler: jest.fn(),
  useAnimatedScrollHandler: jest.fn(),
  useAnimatedRef: jest.fn(),
  scrollTo: jest.fn(),
  FadeIn: jest.fn(),
  FadeOut: jest.fn(),
  Layout: jest.fn(),
};

// Mock NativeWind
export const mockNativeWind = {
  styled: jest.fn().mockImplementation(component => component),
  useColorScheme: jest.fn().mockReturnValue('light'),
};

// Mock Supabase
export const mockSupabase = {
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    session: jest.fn(),
    user: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
};

// Apply mocks
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('react-native/Libraries/Linking/Linking', () => mockLinking);
jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform);
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: mockDimensions.get,
  set: mockDimensions.set,
  addEventListener: mockDimensions.addEventListener,
  removeEventListener: mockDimensions.removeEventListener,
}));
jest.mock('react-native/Libraries/Utilities/Appearance', () => mockAppearance);
jest.mock('react-native-reanimated', () => mockReanimated);
jest.mock('nativewind', () => mockNativeWind);
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue(mockSupabase),
}));
