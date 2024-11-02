import React from 'react';
import { render } from '@testing-library/react-native';
import { OnboardingGoalsScreen } from '../../../screens/onboarding/OnboardingGoalsScreen';
import { useOfflineSync } from '../../../hooks/useOfflineSync';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

jest.mock('../../../hooks/useOfflineSync');

type OnboardingStackParamList = {
  Welcome: undefined;
  OnboardingGoals: undefined;
};

type MockNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingGoals'>;

const mockNavigation: MockNavigationProp = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
};

describe('OnboardingGoalsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      updateData: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<OnboardingGoalsScreen navigation={mockNavigation} />);

    expect(getByText('Set Your Goals')).toBeTruthy();
  });

  it('shows loading state when data is loading', () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      updateData: jest.fn(),
    });

    const { getByTestId } = render(<OnboardingGoalsScreen navigation={mockNavigation} />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows error state when there is an error', () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Test error'),
      updateData: jest.fn(),
    });

    const { getByText } = render(<OnboardingGoalsScreen navigation={mockNavigation} />);

    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
