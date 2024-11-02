import React from 'react';
import { render } from '@testing-library/react-native';
import { OfflineNotice } from '../../../components/common/OfflineNotice';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(),
}));

type NetInfoState = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
};

describe('OfflineNotice', () => {
  const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when online', () => {
    const mockState: NetInfoState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    };

    (mockNetInfo.useNetInfo as jest.Mock).mockReturnValue(mockState);

    const { queryByTestId } = render(<OfflineNotice />);
    expect(queryByTestId('offline-notice')).toBeNull();
  });

  it('renders offline notice when not connected', () => {
    const mockState: NetInfoState = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    };

    (mockNetInfo.useNetInfo as jest.Mock).mockReturnValue(mockState);

    const { getByTestId, getByText } = render(<OfflineNotice />);
    expect(getByTestId('offline-notice')).toBeTruthy();
    expect(getByText('No Internet Connection')).toBeTruthy();
  });

  it('renders offline notice when internet is not reachable', () => {
    const mockState: NetInfoState = {
      isConnected: true,
      isInternetReachable: false,
      type: 'wifi',
    };

    (mockNetInfo.useNetInfo as jest.Mock).mockReturnValue(mockState);

    const { getByTestId, getByText } = render(<OfflineNotice />);
    expect(getByTestId('offline-notice')).toBeTruthy();
    expect(getByText('No Internet Connection')).toBeTruthy();
  });

  it('handles null connection states gracefully', () => {
    const mockState: NetInfoState = {
      isConnected: null,
      isInternetReachable: null,
      type: 'unknown',
    };

    (mockNetInfo.useNetInfo as jest.Mock).mockReturnValue(mockState);

    const { queryByTestId } = render(<OfflineNotice />);
    expect(queryByTestId('offline-notice')).toBeNull();
  });
});
