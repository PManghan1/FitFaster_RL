import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { NavigationState, ParamListBase, RouteProp } from '@react-navigation/native';
import {
  render,
  fireEvent,
  cleanup,
  act,
  type RenderOptions,
  type RenderAPI,
} from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { jest } from '@jest/globals';

type PartialState = Partial<Omit<NavigationState, 'stale' | 'routes'>> & {
  routes: Array<{
    name: string;
    params?: object;
  }>;
};

interface NavigationHelpersMock {
  navigate: jest.Mock;
  goBack: jest.Mock;
  setOptions: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  dispatch: jest.Mock;
  reset: jest.Mock;
  isFocused: jest.Mock;
  canGoBack: jest.Mock;
}

interface MockRouteProps extends RouteProp<ParamListBase, string> {
  params: Record<string, unknown>;
  name: string;
  key: string;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialNavigationState?: PartialState;
  routeParams?: Partial<MockRouteProps>;
  preloadedState?: Record<string, unknown>;
}

const containerStyle: ViewStyle = {
  flex: 1,
};

const TestProviders = React.memo(function TestProviders(
  _props: void,
  children: ReactNode
): ReactElement {
  return React.createElement(
    SafeAreaProvider,
    null,
    React.createElement(
      GestureHandlerRootView,
      { style: containerStyle },
      React.createElement(NavigationContainer, null, children)
    )
  );
});

function customRender(ui: ReactElement, options: CustomRenderOptions = {}): RenderAPI {
  const { ...renderOptions } = options;

  const WrapperComponent = React.memo(function WrapperComponent({
    children,
  }: {
    children: ReactNode;
  }): ReactElement {
    return React.createElement(TestProviders, null, children);
  });

  return render(ui, { wrapper: WrapperComponent, ...renderOptions });
}

interface TestProps {
  navigation: NavigationHelpersMock;
  route: MockRouteProps;
}

const createTestProps = (props: Partial<TestProps> = {}): TestProps => ({
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    ...props.navigation,
  },
  route: {
    params: {},
    name: 'TestScreen',
    key: 'test-screen',
    ...props.route,
  },
});

interface EventOptions {
  skipCleanup?: boolean;
}

const simulatePress = (element: ReactTestInstance, options: EventOptions = {}): void => {
  act(() => {
    fireEvent.press(element);
  });
  if (!options.skipCleanup) {
    cleanup();
  }
};

const simulateChangeText = (
  element: ReactTestInstance,
  text: string,
  options: EventOptions = {}
): void => {
  act(() => {
    fireEvent.changeText(element, text);
  });
  if (!options.skipCleanup) {
    cleanup();
  }
};

const waitForElement = async <T>(
  callback: () => T | null | undefined,
  { timeout = 1000 }: { timeout?: number } = {}
): Promise<T> => {
  const startTime = Date.now();
  let lastError: Error | undefined;

  while (Date.now() - startTime < timeout) {
    try {
      const result = callback();
      if (result) return result;
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  throw lastError || new Error(`Timed out after ${timeout}ms`);
};

const fillForm = (
  getByTestId: (id: string) => ReactTestInstance,
  fields: Record<string, string>,
  options: EventOptions = {}
): void => {
  act(() => {
    Object.entries(fields).forEach(([fieldId, value]) => {
      const input = getByTestId(fieldId);
      simulateChangeText(input, value, { skipCleanup: true });
    });
  });
  if (!options.skipCleanup) {
    cleanup();
  }
};

const createNavigationMock = (): NavigationHelpersMock => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
});

export {
  customRender as render,
  cleanup,
  act,
  fireEvent,
  createTestProps,
  simulatePress,
  simulateChangeText,
  waitForElement,
  fillForm,
  createNavigationMock,
  type TestProps,
  type EventOptions,
  type CustomRenderOptions,
};
