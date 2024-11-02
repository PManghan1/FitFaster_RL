import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { WelcomeScreen } from '../../../screens/onboarding/WelcomeScreen';
import { useOfflineSync } from '../../../hooks/useOfflineSync';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

jest.mock('../../../hooks/useOfflineSync');

type OnboardingStackParamList = {
  Welcome: undefined;
  Goals: undefined;
};

type MockNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

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

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOfflineSync as jest.Mock).mockReturnValue({
      updateData: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    expect(getByText('Welcome to FitFaster')).toBeTruthy();
    expect(getByText("Let's Get Started")).toBeTruthy();
    expect(
      getByText(
        'Tell us about your fitness goals and preferences to help us personalize your experience.'
      )
    ).toBeTruthy();
  });

  it('handles form submission', async () => {
    const { getByText } = render(<WelcomeScreen navigation={mockNavigation} />);

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Goals');
  });

  it('shows loading state during submission', async () => {
    const mockUpdateData = jest
      .fn()
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    (useOfflineSync as jest.Mock).mockReturnValue({
      updateData: mockUpdateData,
      isLoading: false,
      error: null,
    });

    const { getByText, getByTestId } = render(<WelcomeScreen navigation={mockNavigation} />);

    await act(async () => {
      fireEvent.press(getByText('Continue'));
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
  });
});
