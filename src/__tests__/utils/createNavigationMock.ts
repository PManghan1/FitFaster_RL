import { jest } from '@jest/globals';

export interface NavigationMock {
  navigate: jest.Mock;
  goBack: jest.Mock;
  dispatch: jest.Mock;
  setParams: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  reset: jest.Mock;
  isFocused: jest.Mock;
  canGoBack: jest.Mock;
}

/**
 * Creates a mock navigation object for testing components that use navigation.
 * All navigation methods are Jest mock functions that can be used to verify calls.
 *
 * @example
 * ```tsx
 * const navigation = createNavigationMock();
 * render(<MyComponent navigation={navigation} />);
 * expect(navigation.navigate).toHaveBeenCalledWith('Home');
 * ```
 *
 * @returns A mock navigation object with all common navigation methods
 */
export function createNavigationMock(): NavigationMock {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
  };
}
