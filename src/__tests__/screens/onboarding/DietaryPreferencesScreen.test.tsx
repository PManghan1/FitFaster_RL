import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DietaryPreferencesScreen from '../../../screens/onboarding/DietaryPreferencesScreen';
import { useOnboarding } from '../../../hooks/useOnboarding';

jest.mock('../../../hooks/useOnboarding', () => ({
  useOnboarding: jest.fn(),
}));

describe('DietaryPreferencesScreen', () => {
  const mockHandleDietaryPreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboarding as jest.Mock).mockReturnValue({
      handleDietaryPreferences: mockHandleDietaryPreferences,
    });
  });

  it('renders all diet type options', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    expect(getByText('Omnivore')).toBeTruthy();
    expect(getByText('Vegetarian')).toBeTruthy();
    expect(getByText('Vegan')).toBeTruthy();
    expect(getByText('Pescatarian')).toBeTruthy();
    expect(getByText('Keto')).toBeTruthy();
    expect(getByText('Paleo')).toBeTruthy();
  });

  it('allows adding dietary restrictions', () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Add a restriction');
    fireEvent.changeText(input, 'No nuts');
    fireEvent.press(getByText('Add'));

    expect(getByText('No nuts')).toBeTruthy();
  });

  it('allows adding food intolerances', () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('Add an intolerance');
    fireEvent.changeText(input, 'Lactose');
    fireEvent.press(getByText('Add'));

    expect(getByText('Lactose')).toBeTruthy();
  });

  it('allows removing restrictions and intolerances', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    // Add restriction
    const restrictionInput = getByPlaceholderText('Add a restriction');
    fireEvent.changeText(restrictionInput, 'No nuts');
    fireEvent.press(getByText('Add'));

    // Remove restriction
    fireEvent.press(getByText('No nuts'));
    expect(queryByText('No nuts')).toBeNull();
  });

  it('submits dietary preferences successfully', async () => {
    mockHandleDietaryPreferences.mockResolvedValue({ isValid: true });

    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    // Select diet type
    fireEvent.press(getByText('Vegetarian'));

    // Add restriction
    const restrictionInput = getByPlaceholderText('Add a restriction');
    fireEvent.changeText(restrictionInput, 'No nuts');
    fireEvent.press(getByText('Add'));

    // Submit
    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(mockHandleDietaryPreferences).toHaveBeenCalledWith({
      diet: 'vegetarian',
      restrictions: ['No nuts'],
      intolerances: [],
    });
  });

  it('displays validation errors from hook', async () => {
    mockHandleDietaryPreferences.mockResolvedValue({
      isValid: false,
      errors: { diet: 'Invalid diet type' },
    });

    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(getByText('Invalid diet type')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByA11yLabel } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    expect(getByA11yLabel('Vegetarian diet type')).toBeTruthy();
  });
});
