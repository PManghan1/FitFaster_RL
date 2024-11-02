import '@testing-library/jest-native/extend-expect';
import { View } from 'react-native';

// Mock timers
jest.useFakeTimers();

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  getEntriesByType: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  timeOrigin: Date.now(),
  toJSON: jest.fn(),
  eventCounts: {
    size: 0,
    [Symbol.iterator]: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  },
  navigation: {
    type: 0,
    redirectCount: 0,
    timing: {},
    toJSON: jest.fn(),
  },
  onresourcetimingbufferfull: null,
  timing: {},
  memory: {},
};

global.performance = mockPerformance as unknown as Performance;

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
      update: jest.fn(),
      select: jest.fn(),
      eq: jest.fn(),
    })),
  })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = {
    View,
    default: {
      call: jest.fn(),
    },
  };
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: View,
  DrawerLayout: View,
  State: {},
  ScrollView: View,
  Slider: View,
  Switch: View,
  TextInput: View,
  ToolbarAndroid: View,
  ViewPagerAndroid: View,
  DrawerLayoutAndroid: View,
  WebView: View,
  NativeViewGestureHandler: View,
  TapGestureHandler: View,
  FlingGestureHandler: View,
  ForceTouchGestureHandler: View,
  LongPressGestureHandler: View,
  PanGestureHandler: View,
  PinchGestureHandler: View,
  RotationGestureHandler: View,
  RawButton: View,
  BaseButton: View,
  RectButton: View,
  BorderlessButton: View,
  FlatList: View,
  gestureHandlerRootHOC: jest.fn(),
  Directions: {},
}));
