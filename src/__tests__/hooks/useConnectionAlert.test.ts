import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useConnectionAlert } from '../../hooks/useConnectionAlert';
import { useNetInfo } from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(),
}));

describe('useConnectionAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows alert when there is no internet connection', async () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false });
    const { result } = renderHook(() => useConnectionAlert());
    const mockAction = jest.fn();

    await act(async () => {
      await result.current.checkConnection(mockAction);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      [{ text: 'OK', style: 'cancel' }]
    );
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('executes action when there is internet connection', async () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });
    const { result } = renderHook(() => useConnectionAlert());
    const mockAction = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.checkConnection(mockAction);
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockAction).toHaveBeenCalled();
  });

  it('shows alert when action fails', async () => {
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true });
    const { result } = renderHook(() => useConnectionAlert());
    const mockAction = jest.fn().mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.checkConnection(mockAction);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Connection Error',
      'Unable to complete action. Please check your connection and try again.',
      [{ text: 'OK', style: 'cancel' }]
    );
    expect(mockAction).toHaveBeenCalled();
  });

  it('handles connection state changes', async () => {
    let isConnected = false;
    (useNetInfo as jest.Mock).mockImplementation(() => ({ isConnected }));

    const { result } = renderHook(() => useConnectionAlert());
    const mockAction = jest.fn();

    // Test with no connection
    await act(async () => {
      await result.current.checkConnection(mockAction);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'No Internet Connection',
      expect.any(String),
      expect.any(Array)
    );
    expect(mockAction).not.toHaveBeenCalled();

    // Update connection state and re-render
    jest.clearAllMocks();
    mockAction.mockResolvedValue(undefined);
    isConnected = true;

    // Force a re-render by updating the mock implementation
    (useNetInfo as jest.Mock).mockImplementation(() => ({ isConnected }));

    await act(async () => {
      await result.current.checkConnection(mockAction);
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockAction).toHaveBeenCalled();
  });
});
