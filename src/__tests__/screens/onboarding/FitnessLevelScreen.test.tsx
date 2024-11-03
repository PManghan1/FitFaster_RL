import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import FitnessLevelScreen from '../../../screens/onboarding/FitnessLevelScreen';
import { useOnboarding } from '../../../hooks/useOnboarding';

jest.mock('../../../hooks/useOnboarding', () => ({
  useOnboarding: jest.fn(),
}));

describe('FitnessLevelScreen', () => {
  const mockHandleFitnessLevel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboarding as jest.Mock).mockReturnValue({
      handleFitnessLevel: mockHandleFitnessLevel,
    });
  });

  it('renders all fitness level options', () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    expect(getByText('Beginner')).toBeTruthy();
    expect(getByText('Intermediate')).toBeTruthy();
    expect(getByText('Advanced')).toBeTruthy();
    expect(getByText('Athlete')).toBeTruthy();
  });

  it('handles fitness level selection', () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    const beginnerOption = getByText('Beginner');
    fireEvent.press(beginnerOption);

    const continueButton = getByText('Continue');
    expect(continueButton.props.disabled).toBeFalsy();
  });

  it('shows error when trying to continue without selection', () => {
    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    expect(getByText('Please select your fitness level')).toBeTruthy();
  });

  it('submits selected fitness level', async () => {
    mockHandleFitnessLevel.mockResolvedValue({ isValid: true });

    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Intermediate'));

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(mockHandleFitnessLevel).toHaveBeenCalledWith('intermediate');
  });

  it('displays validation errors from hook', async () => {
    mockHandleFitnessLevel.mockResolvedValue({
      isValid: false,
      errors: { level: 'Invalid fitness level' },
    });

    const { getByText } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Intermediate'));

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(getByText('Invalid fitness level')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByA11yLabel } = render(
      <NavigationContainer>
        <FitnessLevelScreen />
      </NavigationContainer>
    );

    expect(getByA11yLabel('Beginner fitness level')).toBeTruthy();
    expect(getByA11yLabel('Continue to next step')).toBeTruthy();
  });
});
