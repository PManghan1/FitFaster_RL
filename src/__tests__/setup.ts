import '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock config
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    auth: {
      providers: {
        google: {
          enabled: false,
          clientId: null,
        },
        facebook: {
          enabled: false,
          clientId: null,
        },
        apple: {
          enabled: false,
          clientId: null,
        },
      },
      passwordMinLength: 8,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
    },
    api: {
      baseUrl: 'http://localhost:3000',
      timeout: 5000,
    },
    supabase: {
      url: 'mock-supabase-url',
      anonKey: 'mock-supabase-key',
    },
  },
  validateConfig: () => true,
}));

// Mock theme constants
jest.mock('../constants/theme', () => ({
  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  FONT_SIZE: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  COLORS: {
    primary: {
      default: '#007AFF',
      light: '#4DA2FF',
      dark: '#0055B3',
    },
    background: {
      default: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#E5E5E5',
    },
    text: {
      default: '#000000',
      light: '#666666',
      lighter: '#999999',
      error: '#FF3B30',
    },
    border: {
      default: '#E5E5E5',
      light: '#F5F5F5',
    },
    error: {
      default: '#FF3B30',
      light: '#FFD7D5',
    },
    success: {
      default: '#34C759',
      light: '#D1F2D9',
    },
  },
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock status bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => 'StatusBar',
}));

// Mock feather icons
jest.mock('react-native-feather', () => ({
  Activity: () => 'Activity',
  Plus: () => 'Plus',
  X: () => 'X',
  Clock: () => 'Clock',
  Calendar: () => 'Calendar',
  Award: () => 'Award',
  TrendingUp: () => 'TrendingUp',
  ChevronRight: () => 'ChevronRight',
  Star: () => 'Star',
  Shield: () => 'Shield',
  AlertTriangle: () => 'AlertTriangle',
  FileText: () => 'FileText',
  ExternalLink: () => 'ExternalLink',
  Eye: () => 'Eye',
  EyeOff: () => 'EyeOff',
  Lock: () => 'Lock',
}));
