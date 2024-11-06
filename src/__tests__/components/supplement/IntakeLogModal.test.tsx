import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntakeLogModal } from '../../../components/supplement/IntakeLogModal';
import type { Supplement } from '../../../types/supplement';

const mockSupplement: Supplement = {
  id: '123',
  name: 'Vitamin D',
  dosage: 1000,
  unit: 'mg',
  frequency: 'daily',
  startDate: new Date(),
  remindersEnabled: false,
  reminderTimes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('IntakeLogModal', () => {
  it('renders correctly with supplement information', () => {
    const { getByText, getByPlaceholderText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={jest.fn()}
      />
    );

    expect(getByText('Log Supplement Intake')).toBeTruthy();
    expect(getByText('Vitamin D')).toBeTruthy();
    expect(getByPlaceholderText(`Enter dosage in ${mockSupplement.unit}`)).toBeTruthy();
    expect(getByPlaceholderText('Add any notes about this intake')).toBeTruthy();
  });

  it('calls onClose when Cancel button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={onClose}
        onLog={jest.fn()}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onLog with correct values when form is submitted', () => {
    const onLog = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={onLog}
      />
    );

    const dosageInput = getByPlaceholderText(`Enter dosage in ${mockSupplement.unit}`);
    const notesInput = getByPlaceholderText('Add any notes about this intake');

    fireEvent.changeText(dosageInput, '2000');
    fireEvent.changeText(notesInput, 'Test notes');
    fireEvent.press(getByText('Log Intake'));

    expect(onLog).toHaveBeenCalledWith(2000, 'Test notes');
  });

  it('does not call onLog when dosage is invalid', () => {
    const onLog = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={onLog}
      />
    );

    const dosageInput = getByPlaceholderText(`Enter dosage in ${mockSupplement.unit}`);
    fireEvent.changeText(dosageInput, '-1');
    fireEvent.press(getByText('Log Intake'));

    expect(onLog).not.toHaveBeenCalled();
  });

  it('trims notes before submitting', () => {
    const onLog = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <IntakeLogModal
        visible={true}
        supplement={mockSupplement}
        onClose={jest.fn()}
        onLog={onLog}
      />
    );

    const dosageInput = getByPlaceholderText(`Enter dosage in ${mockSupplement.unit}`);
    const notesInput = getByPlaceholderText('Add any notes about this intake');

    fireEvent.changeText(dosageInput, '2000');
    fireEvent.changeText(notesInput, '  Test notes  ');
    fireEvent.press(getByText('Log Intake'));

    expect(onLog).toHaveBeenCalledWith(2000, 'Test notes');
  });
});
