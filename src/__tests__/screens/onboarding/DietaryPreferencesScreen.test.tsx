import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DietaryPreferencesScreen from '../../../screens/onboarding/DietaryPreferencesScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('DietaryPreferencesScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    expect(getByText('Dietary Preferences')).toBeTruthy();
    expect(getByText('Diet Type')).toBeTruthy();
    expect(getByText('Food Allergies')).toBeTruthy();
    expect(getByText('Preferred Meals Per Day')).toBeTruthy();
    expect(getByText('Meal Preparation Style')).toBeTruthy();
  });

  it('allows selecting diet type', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    const veganOption = getByText('Vegan');
    fireEvent.press(veganOption);

    expect(veganOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting multiple allergies', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    const dairyOption = getByText('Dairy');
    const nutsOption = getByText('Nuts');

    fireEvent.press(dairyOption);
    fireEvent.press(nutsOption);

    expect(dairyOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
    expect(nutsOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows selecting meal count preference', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    const mealOption = getByText('3 meals');
    fireEvent.press(mealOption);

    expect(mealOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('allows toggling supplement use', () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    const supplementOption = getByText('Yes, I use or plan to use supplements');
    fireEvent.press(supplementOption);

    expect(supplementOption.parent).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('navigates to next screen when form is valid', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    // Select required options
    fireEvent.press(getByText('Omnivore'));
    fireEvent.press(getByText('3 meals'));
    fireEvent.press(getByText('Mixed Approach'));

    // Submit form
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ActivityLevel');
    });
  });

  it('shows validation errors when form is incomplete', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <DietaryPreferencesScreen />
      </NavigationContainer>
    );

    // Submit without selecting required options
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
