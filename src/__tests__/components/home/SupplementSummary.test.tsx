import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SupplementSummary } from '../../../components/home/SupplementSummary';
import useSupplementStore from '../../../store/supplement.store';
import { createMockSupplement, createMockIntake } from '../../utils/supplement-test-utils';

jest.mock('../../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('SupplementSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no supplements exist', () => {
    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements: [],
      intakes: [],
    });

    const { getByText } = render(
      <NavigationContainer>
        <SupplementSummary />
      </NavigationContainer>
    );

    expect(getByText('Add your supplements to start tracking')).toBeTruthy();
  });

  it('displays correct progress and compliance', () => {
    const supplements = [createMockSupplement({ id: '1' }), createMockSupplement({ id: '2' })];

    const today = new Date();
    const intakes = [
      createMockIntake({
        supplementId: '1',
        intakeDateTime: today,
      }),
    ];

    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements,
      intakes,
    });

    const { getByText } = render(
      <NavigationContainer>
        <SupplementSummary />
      </NavigationContainer>
    );

    expect(getByText('1/2')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
  });

  it('shows next reminder when available', () => {
    const supplements = [
      createMockSupplement({
        id: '1',
        name: 'Vitamin D',
        remindersEnabled: true,
        reminderTimes: ['14:00'],
      }),
    ];

    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements,
      intakes: [],
    });

    const { getByText } = render(
      <NavigationContainer>
        <SupplementSummary />
      </NavigationContainer>
    );

    expect(getByText(/Vitamin D at/)).toBeTruthy();
  });

  it('navigates to supplements screen when pressed', () => {
    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements: [],
      intakes: [],
    });

    const { getByRole } = render(
      <NavigationContainer>
        <SupplementSummary />
      </NavigationContainer>
    );

    fireEvent.press(getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith('Supplements');
  });

  it('has proper accessibility labels', () => {
    const supplements = [createMockSupplement({ id: '1' }), createMockSupplement({ id: '2' })];

    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements,
      intakes: [],
    });

    const { getByRole } = render(
      <NavigationContainer>
        <SupplementSummary />
      </NavigationContainer>
    );

    const summary = getByRole('button');
    expect(summary.props.accessibilityLabel).toContain('2 remaining today');
    expect(summary.props.accessibilityHint).toBe('Navigate to supplements screen');
  });
});
