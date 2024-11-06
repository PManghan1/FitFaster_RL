import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SupplementCard } from '../../../components/supplement/SupplementCard';
import type { Supplement } from '../../../types/supplement';

const mockSupplement: Supplement = {
  id: '123',
  name: 'Vitamin D',
  dosage: 1000,
  unit: 'mg',
  frequency: 'daily',
  startDate: new Date(),
  remindersEnabled: true,
  reminderTimes: ['09:00', '21:00'],
  notes: 'Take with food',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SupplementCard', () => {
  it('renders supplement information correctly', () => {
    const { getByText } = render(
      <SupplementCard supplement={mockSupplement} onPress={jest.fn()} onLogIntake={jest.fn()} />
    );

    expect(getByText('Vitamin D')).toBeTruthy();
    expect(getByText('1000 mg • daily')).toBeTruthy();
    expect(getByText('Take with food')).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
    expect(getByText('21:00')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SupplementCard supplement={mockSupplement} onPress={onPress} onLogIntake={jest.fn()} />
    );

    fireEvent.press(getByText('Vitamin D'));
    expect(onPress).toHaveBeenCalled();
  });

  it('calls onLogIntake when Log Intake button is pressed', () => {
    const onLogIntake = jest.fn();
    const { getByText } = render(
      <SupplementCard supplement={mockSupplement} onPress={jest.fn()} onLogIntake={onLogIntake} />
    );

    fireEvent.press(getByText('Log Intake'));
    expect(onLogIntake).toHaveBeenCalled();
  });

  it('does not render reminder times when reminders are disabled', () => {
    const supplementWithoutReminders = {
      ...mockSupplement,
      remindersEnabled: false,
    };

    const { queryByText } = render(
      <SupplementCard
        supplement={supplementWithoutReminders}
        onPress={jest.fn()}
        onLogIntake={jest.fn()}
      />
    );

    expect(queryByText('09:00')).toBeNull();
    expect(queryByText('21:00')).toBeNull();
  });

  it('does not render notes section when notes are empty', () => {
    const supplementWithoutNotes = {
      ...mockSupplement,
      notes: undefined,
    };

    const { queryByText } = render(
      <SupplementCard
        supplement={supplementWithoutNotes}
        onPress={jest.fn()}
        onLogIntake={jest.fn()}
      />
    );

    expect(queryByText('Take with food')).toBeNull();
  });
});
