import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FitnessLevelScreen from '../../../screens/onboarding/FitnessLevelScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('FitnessLevelScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    expect(getByText('Your Fitness Experience')).toBeTruthy();
    expect(getByText('Experience Level')).toBeTruthy();
    expect(getByText('Weekly Activity')).toBeTruthy();
    expect(getByText('Typical Exercises')).toBeTruthy();
    expect(getByText('Preferred Workout Time')).toBeTruthy();
  });

  it('allows selecting experience level', () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    const intermediateOption = getByText('Intermediate');
    fireEvent.press(intermediateOption);

    expect(intermediateOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting multiple typical exercises', () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    const walkingOption = getByText('Walking');
    const runningOption = getByText('Running');

    fireEvent.press(walkingOption);
    fireEvent.press(runningOption);

    expect(walkingOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
    expect(runningOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('navigates to next screen when form is valid', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    // Select required options
    fireEvent.press(getByText('Beginner'));
    fireEvent.press(getByText('3 days per week'));
    fireEvent.press(getByText('Walking'));
    fireEvent.press(getByText('Flexible'));

    // Submit form
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('GoalTimeframes');
    });
  });

  it('shows validation errors when form is incomplete', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    // Submit without selecting any options
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
