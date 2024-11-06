import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntakeLogModal } from '../../../components/supplement/IntakeLogModal';
import { createMockSupplement } from '../../utils/supplement-test-utils';
import { AccessibilityInfo } from 'react-native';

describe('IntakeLogModal Accessibility', () => {
  const mockSupplement = createMockSupplement();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sets initial focus on dosage input', () => {
    const { getByPlaceholderText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={jest.fn()}
      />
    );

    const dosageInput = getByPlaceholderText(`Enter dosage in ${mockSupplement.unit}`);
    jest.advanceTimersByTime(100);
    expect(dosageInput).toHaveFocus();
  });

  it('announces validation errors to screen readers', () => {
    const announceForAccessibility = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

    const { getByText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={jest.fn()}
      />
    );

    fireEvent.press(getByText('Log Intake'));
    expect(announceForAccessibility).toHaveBeenCalledWith('Please enter a valid dosage amount');
  });

  it('has proper modal accessibility configuration', () => {
    const { getByA11yRole } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={jest.fn()}
      />
    );

    const modal = getByA11yRole('alert');
    expect(modal.props.accessibilityViewIsModal).toBe(true);
    expect(modal.props.accessibilityLabel).toBe('Log supplement intake');
  });

  it('provides clear accessibility hints for actions', () => {
    const { getByRole } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={jest.fn()}
      />
    );

    const submitButton = getByRole('button', { name: 'Submit intake log' });
    expect(submitButton.props.accessibilityHint).toBe('Saves the intake record');

    const cancelButton = getByRole('button', { name: 'Cancel logging intake' });
    expect(cancelButton.props.accessibilityHint).toBe('Closes the form without saving');
  });

  it('has adequate touch target sizes for buttons', () => {
    const { getByRole } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={jest.fn()}
      />
    );

    const submitButton = getByRole('button', { name: 'Submit intake log' });
    const cancelButton = getByRole('button', { name: 'Cancel logging intake' });

    expect(submitButton.props.style).toMatchObject({ minHeight: 44 });
    expect(cancelButton.props.style).toMatchObject({ minHeight: 44 });
  });
});
