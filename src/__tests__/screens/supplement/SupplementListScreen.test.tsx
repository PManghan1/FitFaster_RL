import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SupplementListScreen } from '../../../screens/supplement/SupplementListScreen';
import useSupplementStore from '../../../store/supplement.store';

// Mock the store
jest.mock('../../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockSupplements = [
  {
    id: '1',
    name: 'Vitamin D',
    dosage: 1000,
    unit: 'mg',
    frequency: 'daily',
    startDate: new Date(),
    remindersEnabled: true,
    reminderTimes: ['09:00'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Vitamin C',
    dosage: 500,
    unit: 'mg',
    frequency: 'daily',
    startDate: new Date(),
    remindersEnabled: false,
    reminderTimes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('SupplementListScreen', () => {
  beforeEach(() => {
    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements: mockSupplements,
      logIntake: jest.fn(),
    });
  });

  it('renders list of supplements', () => {
    const { getByText } = render(
      <NavigationContainer>
        <SupplementListScreen />
      </NavigationContainer>
    );

    expect(getByText('Vitamin D')).toBeTruthy();
    expect(getByText('Vitamin C')).toBeTruthy();
  });

  it('navigates to AddSupplement screen when FAB is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <SupplementListScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Add'));
    expect(mockNavigate).toHaveBeenCalledWith('AddSupplement');
  });

  it('navigates to SupplementDetails when a supplement card is pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <SupplementListScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Vitamin D'));
    expect(mockNavigate).toHaveBeenCalledWith('SupplementDetails', {
      supplementId: '1',
    });
  });

  it('shows empty state when no supplements exist', () => {
    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements: [],
      logIntake: jest.fn(),
    });

    const { getByText } = render(
      <NavigationContainer>
        <SupplementListScreen />
      </NavigationContainer>
    );

    expect(getByText('No supplements added yet')).toBeTruthy();
    expect(getByText('Add Your First Supplement')).toBeTruthy();
  });

  it('opens IntakeLogModal when Log Intake is pressed', () => {
    const { getAllByText, getByText } = render(
      <NavigationContainer>
        <SupplementListScreen />
      </NavigationContainer>
    );

    fireEvent.press(getAllByText('Log Intake')[0]);
    expect(getByText('Log Supplement Intake')).toBeTruthy();
  });

  it('logs intake when submitted through modal', () => {
    const mockLogIntake = jest.fn();
    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements: mockSupplements,
      logIntake: mockLogIntake,
    });

    const { getAllByText, getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <SupplementListScreen />
      </NavigationContainer>
    );

    // Open modal
    fireEvent.press(getAllByText('Log Intake')[0]);

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Enter dosage in mg'), '1000');
    fireEvent.changeText(getByPlaceholderText('Add any notes about this intake'), 'Test note');

    // Submit
    fireEvent.press(getByText('Log Intake'));
    expect(mockLogIntake).toHaveBeenCalledWith('1', 1000, 'Test note');
  });
});
