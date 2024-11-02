import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GoalTimeframesScreen from '../../../screens/onboarding/GoalTimeframesScreen';
import { NavigationContainer } from '@react-navigation/native';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const MockDateTimePicker = ({
    onChange,
  }: {
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
  }) => {
    // Simulate date selection
    onChange(
      { type: 'set', nativeEvent: { timestamp: new Date('2024-12-31').getTime() } },
      new Date('2024-12-31')
    );
    return null;
  };
  return MockDateTimePicker;
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('GoalTimeframesScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
      </NavigationContainer>
    );

    expect(getByText('Set Your Goal Timeline')).toBeTruthy();
    expect(getByText('Primary Goal')).toBeTruthy();
    expect(getByText('Target Date')).toBeTruthy();
    expect(getByText('Weekly Time Commitment')).toBeTruthy();
    expect(getByText('Milestones (Optional)')).toBeTruthy();
  });

  it('allows selecting primary goal', () => {
    const { getByText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
      </NavigationContainer>
    );

    const muscleGainOption = getByText('Muscle Gain');
    fireEvent.press(muscleGainOption);

    expect(muscleGainOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting weekly commitment', () => {
    const { getByText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
      </NavigationContainer>
    );

    const commitment = getByText('5 hours');
    fireEvent.press(commitment);

    expect(commitment.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows adding milestones', () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
      </NavigationContainer>
    );

    const addMilestoneButton = getByText('Add Milestone');
    fireEvent.press(addMilestoneButton);

    expect(getByPlaceholderText('Milestone description')).toBeTruthy();
  });

  it('navigates to next screen when form is valid', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
      </NavigationContainer>
    );

    // Select required options
    fireEvent.press(getByText('Weight Loss'));
    fireEvent.press(getByText('5 hours'));

    // Submit form
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('UserConsent');
    });
  });

  it('shows validation errors when form is incomplete', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
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
