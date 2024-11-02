import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { SocialAuthButton } from '../../../components/auth/SocialAuthButton';

describe('SocialAuthButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Google button correctly', () => {
    const { getByText } = render(<SocialAuthButton provider="google" onPress={mockOnPress} />);

    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('renders Apple button correctly', () => {
    const { getByText } = render(<SocialAuthButton provider="apple" onPress={mockOnPress} />);

    expect(getByText('Continue with Apple')).toBeTruthy();
  });

  it('renders Facebook button correctly', () => {
    const { getByText } = render(<SocialAuthButton provider="facebook" onPress={mockOnPress} />);

    expect(getByText('Continue with Facebook')).toBeTruthy();
  });

  it('handles press events correctly', () => {
    const { getByText } = render(<SocialAuthButton provider="google" onPress={mockOnPress} />);

    fireEvent.press(getByText('Continue with Google'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when isLoading is true', () => {
    const { UNSAFE_getByType } = render(
      <SocialAuthButton provider="google" onPress={mockOnPress} isLoading={true} />,
    );

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('disables button when isLoading is true', () => {
    const { getByText } = render(
      <SocialAuthButton provider="google" onPress={mockOnPress} isLoading={true} />,
    );

    fireEvent.press(getByText('Continue with Google'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies custom styles correctly', () => {
    const customStyle = {
      backgroundColor: '#f0f0f0',
      borderRadius: 12,
    };

    const { getByTestId } = render(
      <SocialAuthButton
        provider="google"
        onPress={mockOnPress}
        style={customStyle}
        testID="social-button"
      />,
    );

    const button = getByTestId('social-button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#f0f0f0',
          borderRadius: 12,
        }),
      ]),
    );
  });

  it('uses correct colors for each provider', () => {
    const providers = ['google', 'apple', 'facebook'] as const;
    const expectedColors = {
      google: '#fff', // White background for Google
      apple: '#000', // Black background for Apple
      facebook: '#1877F2', // Facebook blue
    };

    providers.forEach(provider => {
      const { getByTestId } = render(
        <SocialAuthButton
          provider={provider}
          onPress={mockOnPress}
          testID={`${provider}-button`}
        />,
      );

      const button = getByTestId(`${provider}-button`);
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: expectedColors[provider],
          }),
        ]),
      );
    });
  });
});
