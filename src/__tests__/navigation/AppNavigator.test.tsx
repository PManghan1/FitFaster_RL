import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../../navigation/AppNavigator';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import type { BasicUserInfo } from '../../types/onboarding';
import type { OnboardingGoalsFormData } from '../../types/goals';

jest.mock('../../hooks/useOfflineSync');
jest.mock('react-native-feather', () => ({
  Activity: () => null,
  Home: () => null,
  Calendar: () => null,
  Settings: () => null,
}));

// Mock the navigators and screens
jest.mock('../../navigation/OnboardingNavigator', () => ({
  OnboardingNavigator: () => null,
}));

jest.mock('../../screens/HomeScreen', () => ({
  HomeScreen: () => null,
}));

jest.mock('../../screens/WorkoutScreen', () => ({
  WorkoutScreen: () => null,
}));

jest.mock('../../screens/NutritionTrackingScreen', () => ({
  NutritionTrackingScreen: () => null,
}));

jest.mock('../../screens/AnalyticsScreen', () => ({
  AnalyticsScreen: () => null,
}));

const mockUserInfo: BasicUserInfo = {
  name: 'John Doe',
  age: 25,
  gender: 'male',
  height: 180,
  weight: 75,
  unitSystem: 'metric',
};

const mockUserGoals: OnboardingGoalsFormData = {
  primaryGoal: 'weight-loss',
  secondaryGoals: ['stress-reduction'],
  workoutTypes: ['strength', 'cardio'],
  workoutsPerWeek: 3,
  workoutDuration: 45,
};

const renderWithNavigation = () =>
  render(
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );

describe('AppNavigator', () => {
  const mockUseOfflineSync = useOfflineSync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows onboarding when user info is missing', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: null, isLoading: false, error: null }) // userInfo
      .mockReturnValueOnce({ data: mockUserGoals, isLoading: false, error: null }); // userGoals

    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('onboarding-navigator')).toBeTruthy();
  });

  it('shows onboarding when user goals are missing', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: mockUserInfo, isLoading: false, error: null }) // userInfo
      .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // userGoals

    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('onboarding-navigator')).toBeTruthy();
  });

  it('shows main app when all user data is present', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: mockUserInfo, isLoading: false, error: null }) // userInfo
      .mockReturnValueOnce({ data: mockUserGoals, isLoading: false, error: null }); // userGoals

    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('main-tabs')).toBeTruthy();
  });

  it('prevents going back from onboarding', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: null, isLoading: false, error: null })
      .mockReturnValueOnce({ data: null, isLoading: false, error: null });

    const { getByTestId } = renderWithNavigation();
    const onboarding = getByTestId('onboarding-navigator');
    expect(onboarding.props.options.gestureEnabled).toBe(false);
  });

  it('shows all main tabs when in main app', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: mockUserInfo, isLoading: false, error: null })
      .mockReturnValueOnce({ data: mockUserGoals, isLoading: false, error: null });

    const { getByText } = renderWithNavigation();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Workout')).toBeTruthy();
    expect(getByText('Nutrition')).toBeTruthy();
    expect(getByText('Analytics')).toBeTruthy();
  });

  it('handles loading state gracefully', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: null, isLoading: true, error: null })
      .mockReturnValueOnce({ data: null, isLoading: true, error: null });

    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('loading-screen')).toBeTruthy();
  });

  it('handles error state gracefully', () => {
    mockUseOfflineSync
      .mockReturnValueOnce({ data: null, isLoading: false, error: new Error('Test error') })
      .mockReturnValueOnce({ data: null, isLoading: false, error: null });

    const { getByTestId } = renderWithNavigation();
    expect(getByTestId('error-screen')).toBeTruthy();
  });
});
