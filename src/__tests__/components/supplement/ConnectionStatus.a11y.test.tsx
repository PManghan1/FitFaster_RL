import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectionStatus } from '../../../components/supplement/ConnectionStatus';
import { useNetInfo } from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(),
}));

describe('ConnectionStatus Accessibility', () => {
  beforeEach(() => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false });
  });

  it('has correct accessibility role and live region', () => {
    const { getByRole } = render(<ConnectionStatus />);

    const alert = getByRole('alert');
    expect(alert.props.accessibilityLiveRegion).toBe('polite');
  });

  it('provides clear accessibility label for offline state', () => {
    const { getByLabelText } = render(<ConnectionStatus />);

    const message = getByLabelText(
      'No internet connection. Some features may be limited. Please check your connection.'
    );
    expect(message).toBeTruthy();
  });

  it('hides icon from screen readers', () => {
    const { getByTestId } = render(<ConnectionStatus />);

    const icon = getByTestId('wifi-off-icon');
    expect(icon.props.accessibilityElementsHidden).toBe(true);
    expect(icon.props.importantForAccessibility).toBe('no');
  });

  it('does not render when connected', () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });
    const { queryByRole } = render(<ConnectionStatus />);

    expect(queryByRole('alert')).toBeNull();
  });

  it('has sufficient color contrast', () => {
    const { getByText } = render(<ConnectionStatus />);

    const message = getByText('No internet connection. Some features may be limited.');
    expect(message.props.style).toMatchObject({
      color: '#EF4444', // red-600
      backgroundColor: '#FEF2F2', // red-50
    });
  });
});
