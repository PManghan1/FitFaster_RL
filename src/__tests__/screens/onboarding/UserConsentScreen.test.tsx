import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import UserConsentScreen from '../../../screens/onboarding/UserConsentScreen';
import { useOnboarding } from '../../../hooks/useOnboarding';

jest.mock('../../../hooks/useOnboarding', () => ({
  useOnboarding: jest.fn(),
}));

describe('UserConsentScreen', () => {
  const mockHandleUserConsent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboarding as jest.Mock).mockReturnValue({
      handleUserConsent: mockHandleUserConsent,
    });
  });

  it('renders all consent options', () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    expect(getByText('Health Data Collection')).toBeTruthy();
    expect(getByText('Third-Party Data Sharing')).toBeTruthy();
    expect(getByText('Marketing Communications')).toBeTruthy();
    expect(getByText('Push Notifications')).toBeTruthy();
    expect(getByText('Location Services')).toBeTruthy();
  });

  it('indicates required consents', () => {
    const { getAllByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    const requiredLabels = getAllByText('Required');
    expect(requiredLabels).toHaveLength(2);
  });

  it('toggles consent options', () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Health Data Collection'));
    fireEvent.press(getByText('Push Notifications'));

    expect(getByText('Health Data Collection').props.accessibilityState.checked).toBe(true);
    expect(getByText('Push Notifications').props.accessibilityState.checked).toBe(true);
  });

  it('validates required consents before submission', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(
      getByText('Health data collection and notifications are required to use the app')
    ).toBeTruthy();
  });

  it('submits when required consents are given', async () => {
    mockHandleUserConsent.mockResolvedValue({ isValid: true });

    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Health Data Collection'));
    fireEvent.press(getByText('Push Notifications'));

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(mockHandleUserConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        healthDataCollection: true,
        notifications: true,
      })
    );
  });

  it('displays validation errors from hook', async () => {
    mockHandleUserConsent.mockResolvedValue({
      isValid: false,
      errors: { consent: 'Invalid consent configuration' },
    });

    const { getByText } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Health Data Collection'));
    fireEvent.press(getByText('Push Notifications'));

    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    expect(getByText('Invalid consent configuration')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByA11yLabel } = render(
      <NavigationContainer>
        <UserConsentScreen />
      </NavigationContainer>
    );

    expect(getByA11yLabel('Health Data Collection consent')).toBeTruthy();
    expect(getByA11yLabel('Push Notifications consent')).toBeTruthy();
  });
});
