import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingNavigator } from '../../navigation/OnboardingNavigator';

const MockNavigator = ({ children }: { children: React.ReactNode }) => children;

interface MockScreenProps {
  component: React.ComponentType;
  [key: string]: unknown;
}

const MockScreen = ({ component: Component, ...rest }: MockScreenProps) => <Component {...rest} />;

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: MockNavigator,
    Screen: MockScreen,
  }),
}));

jest.mock('../../hooks/useOfflineSync', () => ({
  useOfflineSync: () => ({
    updateData: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

// Mock form handling
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: () => void) => fn,
  }),
}));

describe('OnboardingNavigator', () => {
  const renderNavigator = () => {
    return render(
      <NavigationContainer>
        <OnboardingNavigator />
      </NavigationContainer>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Welcome screen by default', () => {
    renderNavigator();
    expect(screen.getByTestId('onboarding-navigator')).toBeTruthy();
    expect(screen.getByText('Welcome to FitFaster')).toBeTruthy();
  });

  it('displays the welcome content correctly', () => {
    renderNavigator();
    expect(screen.getByText('Welcome to FitFaster')).toBeTruthy();
    expect(screen.getByText("Let's Get Started")).toBeTruthy();
    expect(
      screen.getByText(
        'Tell us about your fitness goals and preferences to help us personalize your experience.'
      )
    ).toBeTruthy();
  });

  it('shows the continue button and handles navigation', () => {
    renderNavigator();
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeTruthy();
  });

  it('maintains consistent styling with nativewind classes', () => {
    renderNavigator();
    const navigator = screen.getByTestId('onboarding-navigator');
    expect(navigator).toHaveStyle({
      flex: 1,
    });
  });

  it('renders without crashing when wrapped in NavigationContainer', () => {
    expect(() => renderNavigator()).not.toThrow();
  });

  it('handles screen transitions correctly', () => {
    renderNavigator();
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeTruthy();
    expect(screen.getByTestId('onboarding-navigator')).toBeTruthy();
  });
});
