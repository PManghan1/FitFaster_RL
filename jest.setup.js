import 'jest-expect-message';
import '@testing-library/jest-native';

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  EventEmitter: jest.fn()
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mockReanimated = {
    default: {
      call: () => {},
      createAnimatedComponent: (component) => component,
      event: () => {},
      Value: jest.fn(),
      Node: jest.fn()
    }
  };
  return mockReanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {},
  ScrollView: 'ScrollView',
  Slider: 'Slider',
  Switch: 'Switch',
  TextInput: 'TextInput',
  ToolbarAndroid: 'ToolbarAndroid',
  ViewPagerAndroid: 'ViewPagerAndroid',
  DrawerLayoutAndroid: 'DrawerLayoutAndroid',
  WebView: 'WebView',
  NativeViewGestureHandler: 'NativeViewGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  ForceTouchGestureHandler: 'ForceTouchGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  PanGestureHandler: 'PanGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  RawButton: 'RawButton',
  BaseButton: 'BaseButton',
  RectButton: 'RectButton',
  BorderlessButton: 'BorderlessButton',
  FlatList: 'FlatList',
  gestureHandlerRootHOC: jest.fn(),
  Directions: {}
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  }),
  useRoute: () => ({
    params: {}
  })
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}));

// Mock react-native-feather
jest.mock('react-native-feather', () => ({
  Shield: 'Shield',
  Lock: 'Lock',
  Check: 'Check',
  AlertTriangle: 'AlertTriangle',
  Info: 'Info',
  Play: 'Play',
  Pause: 'Pause',
  RotateCcw: 'RotateCcw'
}));

// Mock react-native components
jest.mock('react-native', () => ({
  Platform: {
    select: jest.fn(obj => obj.default)
  },
  StyleSheet: {
    create: jest.fn(),
    compose: jest.fn(),
    flatten: jest.fn()
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  Image: 'Image',
  Animated: {
    View: 'Animated.View',
    createAnimatedComponent: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
    Value: jest.fn()
  }
}));

// Setup global test utilities
global.expect = expect;
