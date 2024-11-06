import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntakeHistory } from '../../../components/supplement/IntakeHistory';
import type { SupplementIntake } from '../../../types/supplement';

const mockIntakes: SupplementIntake[] = [
  {
    id: '1',
    supplementId: '123',
    intakeDateTime: new Date('2024-01-01T09:00:00'),
    dosageTaken: 1000,
    notes: 'Morning dose',
    createdAt: new Date('2024-01-01T09:00:00'),
  },
  {
    id: '2',
    supplementId: '123',
    intakeDateTime: new Date('2024-01-01T21:00:00'),
    dosageTaken: 1000,
    notes: 'Evening dose',
    createdAt: new Date('2024-01-01T21:00:00'),
  },
];

describe('IntakeHistory', () => {
  it('renders empty state message when no intakes', () => {
    const { getByText } = render(<IntakeHistory intakes={[]} />);
    expect(getByText('No intake history available')).toBeTruthy();
  });

  it('renders list of intakes with correct information', () => {
    const { getByText } = render(<IntakeHistory intakes={mockIntakes} />);

    expect(getByText('1000 units')).toBeTruthy();
    expect(getByText('Morning dose')).toBeTruthy();
    expect(getByText('Evening dose')).toBeTruthy();
  });

  it('formats dates correctly', () => {
    const { getAllByText } = render(<IntakeHistory intakes={mockIntakes} />);

    // Check if dates are formatted as expected
    // Note: Exact format may vary by locale, so we check for presence of key parts
    const dateElements = getAllByText(/Jan 1/);
    expect(dateElements.length).toBe(2);
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    const { getAllByText } = render(<IntakeHistory intakes={mockIntakes} onDelete={onDelete} />);

    fireEvent.press(getAllByText('Delete')[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('does not show delete button when onDelete is not provided', () => {
    const { queryByText } = render(<IntakeHistory intakes={mockIntakes} />);
    expect(queryByText('Delete')).toBeNull();
  });

  it('displays notes when available', () => {
    const { getByText } = render(<IntakeHistory intakes={mockIntakes} />);
    expect(getByText('Morning dose')).toBeTruthy();
    expect(getByText('Evening dose')).toBeTruthy();
  });

  it('handles intakes without notes', () => {
    const intakesWithoutNotes = [
      {
        ...mockIntakes[0],
        notes: undefined,
      },
    ];

    const { queryByText } = render(<IntakeHistory intakes={intakesWithoutNotes} />);

    expect(queryByText('Morning dose')).toBeNull();
  });
});
