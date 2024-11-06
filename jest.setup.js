// Import Jest Native matchers
require('@testing-library/jest-native/extend-expect');

// Set up Jest's globals
global.expect = expect;
global.jest = jest;

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
    Version: 123,
  },
  NativeModules: {
    UIManager: {
      RCTView: () => ({
        directEventTypes: {},
        validAttributes: {},
      }),
      getViewManagerConfig: jest.fn(),
    },
    StatusBarManager: {
      getHeight: jest.fn(),
      setColor: jest.fn(),
      setStyle: jest.fn(),
      setHidden: jest.fn(),
    },
    PlatformConstants: {
      forceTouchAvailable: false,
      interfaceIdiom: 'phone',
    },
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(),
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
  Animated: {
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
    })),
    View: 'Animated.View',
    createAnimatedComponent: jest.fn(component => component),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock expo modules
jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      supabaseUrl: 'mock-url',
      supabaseAnonKey: 'mock-key',
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-barcode-scanner
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: 'BarCodeScanner',
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  Constants: {
    Type: {
      QR: 'QR',
    },
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  getPresentedNotificationsAsync: jest.fn(async () => []),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone',
  modelId: 'iPhone12,1',
  deviceYearClass: 2019,
  totalMemory: 2048,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '14.0',
  osBuildId: '18A373',
  osInternalBuildId: '18A373',
  deviceName: 'iPhone',
  getPlatformFeaturesAsync: jest.fn(async () => []),
  hasPlatformFeatureAsync: jest.fn(async () => true),
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(async () => ({ success: true })),
  hasHardwareAsync: jest.fn(async () => true),
  supportedAuthenticationTypesAsync: jest.fn(async () => [1, 2]),
  isEnrolledAsync: jest.fn(async () => true),
  cancelAuthenticate: jest.fn(),
}));

// Mock expo-keep-awake
jest.mock('expo-keep-awake', () => ({
  activateKeepAwake: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    call: () => {},
    createAnimatedComponent: jest.fn(),
    event: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
    Value: jest.fn(),
    Node: jest.fn(),
  },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
}));

// Mock react-native-feather
jest.mock('react-native-feather', () => ({
  ExternalLink: 'ExternalLink',
}));

// Mock styled-components
jest.mock('styled-components/native', () => {
  const styledComponent = Component => {
    const Wrapped = props => {
      return typeof Component === 'string' ? Component : Component(props);
    };
    Wrapped.attrs = () => styledComponent(Component);
    return Wrapped;
  };

  const styled = {
    View: styledComponent('View'),
    Text: styledComponent('Text'),
    TouchableOpacity: styledComponent('TouchableOpacity'),
  };

  return {
    default: new Proxy(styled, {
      get: function (obj, prop) {
        // Return existing components
        if (prop in obj) {
          return obj[prop];
        }
        // Create new styled component for unknown tags
        return styledComponent(prop);
      },
    }),
  };
});

// Global mocks
global.fetch = jest.fn();
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};
