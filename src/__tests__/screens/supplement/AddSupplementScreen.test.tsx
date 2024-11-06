import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AddSupplementScreen } from '../../../screens/supplement/AddSupplementScreen';
import useSupplementStore from '../../../store/supplement.store';
import type { SupplementUnit, SupplementFrequency } from '../../../types/supplement';

// Mock the store
jest.mock('../../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

interface MockPickerProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  selectedValue: string;
}

// Mock Picker
jest.mock('@react-native-picker/picker', () => {
  const MockPicker: React.FC<MockPickerProps> = function MockPicker({
    children,
    onValueChange,
    selectedValue,
  }) {
    return (
      <select
        value={selectedValue}
        onChange={e => onValueChange(e.target.value)}
        data-testid="picker"
      >
        {children}
      </select>
    );
  };

  MockPicker.displayName = 'MockPicker';

  const MockPickerItem: React.FC<{ label: string; value: string }> = function MockPickerItem({
    label,
    value,
  }) {
    return <option value={value}>{label}</option>;
  };

  MockPickerItem.displayName = 'MockPickerItem';

  return {
    Picker: Object.assign(MockPicker, { Item: MockPickerItem }),
  };
});

describe('AddSupplementScreen', () => {
  const mockAddSupplement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSupplementStore as jest.Mock).mockReturnValue({
      addSupplement: mockAddSupplement,
    });
  });

  const fillForm = (getByPlaceholderText: ReturnType<typeof render>['getByPlaceholderText']) => {
    fireEvent.changeText(getByPlaceholderText('Enter supplement name'), 'Vitamin D');
    fireEvent.changeText(getByPlaceholderText('Enter dosage amount'), '1000');
  };

  it('handles form submission with valid data', () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <AddSupplementScreen />
      </NavigationContainer>
    );

    fillForm(getByPlaceholderText);

    fireEvent.press(getByText('Add Supplement'));

    expect(mockAddSupplement).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Vitamin D',
        dosage: 1000,
        unit: 'mg' as SupplementUnit,
        frequency: 'daily' as SupplementFrequency,
      })
    );
  });

  // Rest of the test cases...
});
