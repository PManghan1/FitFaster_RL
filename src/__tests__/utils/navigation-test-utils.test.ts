import {
  renderWithNavigation,
  createNavigationMock,
  mockDeepLink,
  NavigationMock,
} from './navigation-test-utils';

// Mock @react-navigation/native
const mockEmit = jest.fn();
jest.mock('@react-navigation/native', () => ({
  EventEmitter: {
    emit: mockEmit,
  },
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

describe('navigation-test-utils', () => {
  beforeEach(() => {
    mockEmit.mockClear();
  });

  it('exports all required navigation testing utilities', () => {
    expect(renderWithNavigation).toBeDefined();
    expect(createNavigationMock).toBeDefined();
    expect(mockDeepLink).toBeDefined();
  });

  it('provides a working navigation mock', () => {
    const navigation = createNavigationMock();

    navigation.navigate('Home');
    expect(navigation.navigate).toHaveBeenCalledWith('Home');

    navigation.goBack();
    expect(navigation.goBack).toHaveBeenCalled();

    navigation.setParams({ id: '123' });
    expect(navigation.setParams).toHaveBeenCalledWith({ id: '123' });
  });

  it('provides a working deep link mock', async () => {
    await mockDeepLink('test/path');
    expect(mockEmit).toHaveBeenCalledWith('url', {
      url: 'fitfaster://test/path',
    });
  });

  it('provides proper type safety through NavigationMock type', () => {
    // Use the actual createNavigationMock function which provides correct types
    const navigation: NavigationMock = createNavigationMock();

    // Verify all required navigation methods exist and are callable
    expect(typeof navigation.navigate).toBe('function');
    expect(typeof navigation.goBack).toBe('function');
    expect(typeof navigation.setParams).toBe('function');
    expect(typeof navigation.dispatch).toBe('function');
    expect(typeof navigation.addListener).toBe('function');
    expect(typeof navigation.removeListener).toBe('function');
    expect(typeof navigation.reset).toBe('function');
    expect(typeof navigation.isFocused).toBe('function');
    expect(typeof navigation.canGoBack).toBe('function');

    // Verify mock functions can be called without type errors
    navigation.navigate('Home');
    navigation.setParams({ id: '123' });
    navigation.isFocused();
    navigation.canGoBack();

    expect(navigation.navigate).toHaveBeenCalledWith('Home');
    expect(navigation.setParams).toHaveBeenCalledWith({ id: '123' });
    expect(navigation.isFocused).toHaveBeenCalled();
    expect(navigation.canGoBack).toHaveBeenCalled();
  });
});
