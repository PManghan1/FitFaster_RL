import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ActivityLevelScreen from '../../../screens/onboarding/ActivityLevelScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('ActivityLevelScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    expect(getByText('Daily Activity Level')).toBeTruthy();
    expect(getByText('Overall Daily Activity')).toBeTruthy();
    expect(getByText('Occupation Type')).toBeTruthy();
    expect(getByText('Primary Transportation Mode')).toBeTruthy();
    expect(getByText('Weekend Activity Level')).toBeTruthy();
  });

  it('allows selecting daily activity level', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    const activityOption = getByText('Moderately Active');
    fireEvent.press(activityOption);

    expect(activityOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting occupation type', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    const occupationOption = getByText('Desk Job');
    fireEvent.press(occupationOption);

    expect(occupationOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting transportation mode', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    const transportOption = getByText('Mixed');
    fireEvent.press(transportOption);

    expect(transportOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting weekend activity level', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    const weekendOption = getByText('Similar to Weekdays');
    fireEvent.press(weekendOption);

    expect(weekendOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('navigates to next screen when form is valid', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    // Select required options
    fireEvent.press(getByText('Moderately Active'));
    fireEvent.press(getByText('Desk Job'));
    fireEvent.press(getByText('Mixed'));
    fireEvent.press(getByText('Similar to Weekdays'));

    // Submit form
    const continueButton = getByText('Complete Setup');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingGoals');
    });
  });

  it('shows validation errors when form is incomplete', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    // Submit without selecting any options
    const continueButton = getByText('Complete Setup');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
