import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ActivityLevelScreen from '../../../screens/onboarding/ActivityLevelScreen';
import { useOnboarding } from '../../../hooks/useOnboarding';

jest.mock('../../../hooks/useOnboarding', () => ({
  useOnboarding: jest.fn(),
}));

describe('ActivityLevelScreen', () => {
  const mockHandleActivityLevel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboarding as jest.Mock).mockReturnValue({
      handleActivityLevel: mockHandleActivityLevel,
    });
  });

  it('renders all activity level options', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    expect(getByText('Sedentary')).toBeTruthy();
    expect(getByText('Lightly Active')).toBeTruthy();
    expect(getByText('Moderately Active')).toBeTruthy();
    expect(getByText('Very Active')).toBeTruthy();
    expect(getByText('Extra Active')).toBeTruthy();
  });

  it('displays examples for each activity level', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    expect(getByText('Desk job')).toBeTruthy();
    expect(getByText('Regular walking')).toBeTruthy();
    expect(getByText('Regular workouts')).toBeTruthy();
    expect(getByText('Daily training')).toBeTruthy();
    expect(getByText('Professional athlete')).toBeTruthy();
  });

  it('handles activity level selection', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    const moderateOption = getByText('Moderately Active');
    fireEvent.press(moderateOption);

    const completeButton = getByText('Complete Setup');
    expect(completeButton.props.disabled).toBeFalsy();
  });

  it('shows error when trying to continue without selection', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    await act(async () => {
      fireEvent.press(getByText('Complete Setup'));
    });

    expect(getByText('Please select your activity level')).toBeTruthy();
  });

  it('submits selected activity level', async () => {
    mockHandleActivityLevel.mockResolvedValue({ isValid: true });

    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Moderately Active'));

    await act(async () => {
      fireEvent.press(getByText('Complete Setup'));
    });

    expect(mockHandleActivityLevel).toHaveBeenCalledWith('moderately_active');
  });

  it('displays validation errors from hook', async () => {
    mockHandleActivityLevel.mockResolvedValue({
      isValid: false,
      errors: { level: 'Invalid activity level' },
    });

    const { getByText } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Moderately Active'));

    await act(async () => {
      fireEvent.press(getByText('Complete Setup'));
    });

    expect(getByText('Invalid activity level')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByA11yLabel } = render(
      <NavigationContainer>
        <ActivityLevelScreen />
      </NavigationContainer>
    );

    expect(getByA11yLabel('Moderately Active activity level')).toBeTruthy();
    expect(getByA11yLabel('Complete onboarding setup')).toBeTruthy();
  });
});
