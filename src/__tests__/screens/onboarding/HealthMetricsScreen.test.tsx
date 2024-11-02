import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HealthMetricsScreen from '../../../screens/onboarding/HealthMetricsScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('HealthMetricsScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <HealthMetricsScreen />
      </NavigationContainer>
    );

    expect(getByText("Let's get to know you better")).toBeTruthy();
    expect(getByPlaceholderText('Enter your height')).toBeTruthy();
    expect(getByPlaceholderText('Enter your weight')).toBeTruthy();
    expect(getByPlaceholderText('Enter your age')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <HealthMetricsScreen />
      </NavigationContainer>
    );

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to next screen when form is valid', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <HealthMetricsScreen />
      </NavigationContainer>
    );

    // Fill in required fields
    const heightInput = getByPlaceholderText('Enter your height');
    const weightInput = getByPlaceholderText('Enter your weight');
    const ageInput = getByPlaceholderText('Enter your age');

    fireEvent.changeText(heightInput, '170');
    fireEvent.changeText(weightInput, '70');
    fireEvent.changeText(ageInput, '25');

    // Select gender
    const genderOption = getByText('Male');
    fireEvent.press(genderOption);

    // Submit form
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('FitnessLevel');
    });
  });
});
