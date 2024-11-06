import React from 'react';
import { render } from '@testing-library/react-native';
import { SupplementCard } from '../../../components/supplement/SupplementCard';
import { createMockSupplement } from '../../utils/supplement-test-utils';
import { AccessibilityInfo } from 'react-native';

describe('SupplementCard Accessibility', () => {
  const mockSupplement = createMockSupplement({
    name: 'Vitamin D',
    dosage: 1000,
    unit: 'mg',
    frequency: 'daily',
    remindersEnabled: true,
    reminderTimes: ['09:00', '21:00'],
    notes: 'Take with food',
  });

  it('has correct accessibility roles and labels', () => {
    const { getByRole, getAllByRole } = render(
      <SupplementCard supplement={mockSupplement} onPress={jest.fn()} onLogIntake={jest.fn()} />
    );

    // Main card button
    const card = getByRole('button');
    expect(card.props.accessibilityLabel).toBe('Vitamin D details');
    expect(card.props.accessibilityHint).toBe('Double tap to view supplement details');

    // Header
    const header = getByRole('header');
    expect(header).toHaveTextContent('Vitamin D');

    // Log intake button
    const logButton = getAllByRole('button')[1];
    expect(logButton.props.accessibilityLabel).toBe('Log intake for Vitamin D');
    expect(logButton.props.accessibilityHint).toBe('Double tap to log 1000 mg intake');
  });

  it('provides accessible description of reminders', () => {
    const { getByLabelText } = render(
      <SupplementCard supplement={mockSupplement} onPress={jest.fn()} onLogIntake={jest.fn()} />
    );

    const remindersList = getByLabelText('Reminders set for 9:00 AM, 9:00 PM');
    expect(remindersList).toBeTruthy();
  });

  it('has adequate touch target sizes', () => {
    const { getByRole, getAllByRole } = render(
      <SupplementCard supplement={mockSupplement} onPress={jest.fn()} onLogIntake={jest.fn()} />
    );

    // Main card
    const card = getByRole('button');
    expect(card.props.style).toMatchObject({
      minHeight: 88, // At least 44dp x 2 for nested touchables
    });

    // Log intake button
    const logButton = getAllByRole('button')[1];
    expect(logButton.props.style).toMatchObject({
      minHeight: 44,
      minWidth: 100,
    });
  });

  it('announces changes to screen readers', () => {
    const announceForAccessibility = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

    const { rerender } = render(
      <SupplementCard supplement={mockSupplement} onPress={jest.fn()} onLogIntake={jest.fn()} />
    );

    // Update supplement
    const updatedSupplement = {
      ...mockSupplement,
      remindersEnabled: false,
    };

    rerender(
      <SupplementCard supplement={updatedSupplement} onPress={jest.fn()} onLogIntake={jest.fn()} />
    );

    expect(announceForAccessibility).toHaveBeenCalledWith('Reminders disabled');
  });
});
