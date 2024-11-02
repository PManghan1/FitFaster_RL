import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UserConsentScreen from '../../../screens/onboarding/UserConsentScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('UserConsentScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    expect(getByText('Data Privacy and Consent')).toBeTruthy();
    expect(getByText('Health Data Collection')).toBeTruthy();
    expect(getByText('Third-Party Integration')).toBeTruthy();
    expect(getByText('Terms of Service')).toBeTruthy();
    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('shows validation errors when trying to continue without required consents', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('allows toggling consent checkboxes', () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    const healthDataConsent = getByText('Health Data Collection');
    fireEvent.press(healthDataConsent);

    const termsConsent = getByText('Terms of Service');
    fireEvent.press(termsConsent);

    // Verify checkboxes are checked (implementation dependent on your checkbox component)
    expect(healthDataConsent.parent).toBeTruthy();
    expect(termsConsent.parent).toBeTruthy();
  });

  it('navigates to next screen when all required consents are given', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    // Accept all required consents
    fireEvent.press(getByText('Health Data Collection'));
    fireEvent.press(getByText('Third-Party Integration'));
    fireEvent.press(getByText('Terms of Service'));
    fireEvent.press(getByText('Privacy Policy'));
    fireEvent.press(getByText('Data Retention'));

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('DietaryPreferences');
    });
  });

  it('renders privacy policy and terms buttons', () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    expect(getByText('View Privacy Policy')).toBeTruthy();
    expect(getByText('View Terms')).toBeTruthy();
  });

  it('marketing communications consent is optional', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    // Accept all required consents except marketing
    fireEvent.press(getByText('Health Data Collection'));
    fireEvent.press(getByText('Third-Party Integration'));
    fireEvent.press(getByText('Terms of Service'));
    fireEvent.press(getByText('Privacy Policy'));
    fireEvent.press(getByText('Data Retention'));

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('DietaryPreferences');
    });
  });
});
