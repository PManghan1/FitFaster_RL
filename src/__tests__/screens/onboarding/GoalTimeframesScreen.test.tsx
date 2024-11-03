import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GoalTimeframesScreen from '../../../screens/onboarding/GoalTimeframesScreen';
import { useOnboarding } from '../../../hooks/useOnboarding';

interface DateTimePickerEvent {
  type: string;
  nativeEvent: { timestamp: number };
}

jest.mock('../../../hooks/useOnboarding', () => ({
  useOnboarding: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const MockDateTimePicker = ({
    onChange,
  }: {
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
  }) => {
    onChange(
      { type: 'set', nativeEvent: { timestamp: new Date('2024-12-31').getTime() } },
      new Date('2024-12-31')
    );
    return null;
  };
  return MockDateTimePicker;
});

describe('GoalTimeframesScreen', () => {
  const mockHandleGoalTimeframes = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboarding as jest.Mock).mockReturnValue({
      handleGoalTimeframes: mockHandleGoalTimeframes,
    });
  });

  it('allows adding a goal', async () => {
    mockHandleGoalTimeframes.mockResolvedValue({ isValid: true });

    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <GoalTimeframesScreen />
      </NavigationContainer>
    );

    // Select goal type
    fireEvent.press(getByText('Weight Goal'));

    // Enter target value
    fireEvent.changeText(getByPlaceholderText('Enter your target'), '70');

    // Select date
    fireEvent.press(getByText('Select Target Date'));

    // Add goal
    await act(async () => {
      fireEvent.press(getByText('Add Goal'));
    });

    expect(getByText('Target: 70')).toBeTruthy();
  });

  // Add more test cases...
});
