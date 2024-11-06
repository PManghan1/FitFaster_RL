import React from 'react';
import { render } from '@testing-library/react-native';
import { ReminderSettings } from '../../../components/supplement/ReminderSettings';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createMockSupplement } from '../../utils/supplement-test-utils';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const MockDateTimePicker = ({
    onChange,
  }: {
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
  }) => {
    // Simulate time selection
    onChange(
      { type: 'set', nativeEvent: { timestamp: new Date('2024-01-01T09:00:00').getTime() } },
      new Date('2024-01-01T09:00:00')
    );
    return null;
  };
  return MockDateTimePicker;
});

describe('ReminderSettings', () => {
  const mockSupplement = createMockSupplement({
    id: '1',
    remindersEnabled: true,
    reminderTimes: ['09:00', '21:00'],
  });

  it('renders correctly with enabled reminders', () => {
    const { getByText } = render(
      <ReminderSettings supplement={mockSupplement} onUpdateReminders={jest.fn()} />
    );

    expect(getByText('Enable Reminders')).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
    expect(getByText('21:00')).toBeTruthy();
  });
});
