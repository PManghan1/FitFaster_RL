import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useSupplementReminders } from '../../hooks/useSupplementReminders';
import { notificationService } from '../../services/notification';
import useSupplementStore from '../../store/supplement.store';
import { createMockSupplement } from '../utils/supplement-test-utils';
import type { NotificationResponse } from 'expo-notifications';

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn((_: string, handler: (state: string) => void) => {
      // Store the handler for testing
      (AppState as { handler?: (state: string) => void }).handler = handler;
      return { remove: jest.fn() };
    }),
  },
}));

// Mock notification service
jest.mock('../../services/notification', () => ({
  notificationService: {
    requestPermissions: jest.fn(),
    scheduleSupplementReminder: jest.fn(),
    cancelSupplementReminder: jest.fn(),
    cancelAllSupplementReminders: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(
      (handler: (response: NotificationResponse) => void) => {
        // Store the handler for testing
        (
          notificationService as { responseHandler?: (response: NotificationResponse) => void }
        ).responseHandler = handler;
        return { remove: jest.fn() };
      }
    ),
  },
}));

// Mock supplement store
jest.mock('../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useSupplementReminders', () => {
  const mockSupplements = [
    createMockSupplement({
      id: '1',
      remindersEnabled: true,
      reminderTimes: ['09:00', '21:00'],
    }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useSupplementStore as jest.Mock).mockReturnValue({ supplements: mockSupplements });
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue('granted');
  });

  it('requests permissions on mount', async () => {
    await act(async () => {
      renderHook(() => useSupplementReminders());
    });
    expect(notificationService.requestPermissions).toHaveBeenCalled();
  });

  it('schedules reminders for supplements with enabled reminders', async () => {
    const { result } = renderHook(() => useSupplementReminders());

    await act(async () => {
      await result.current.updateReminders();
    });

    expect(notificationService.scheduleSupplementReminder).toHaveBeenCalledTimes(2);
    expect(notificationService.scheduleSupplementReminder).toHaveBeenCalledWith(
      mockSupplements[0],
      '09:00'
    );
    expect(notificationService.scheduleSupplementReminder).toHaveBeenCalledWith(
      mockSupplements[0],
      '21:00'
    );
  });

  it('cancels existing reminders before scheduling new ones', async () => {
    const { result } = renderHook(() => useSupplementReminders());

    await act(async () => {
      await result.current.updateReminders();
    });

    expect(notificationService.cancelAllSupplementReminders).toHaveBeenCalled();
  });

  it('handles permission denial', async () => {
    (notificationService.requestPermissions as jest.Mock).mockResolvedValue('denied');
    const { result } = renderHook(() => useSupplementReminders());

    await act(async () => {
      try {
        await result.current.scheduleReminder(mockSupplements[0], '09:00');
      } catch (error) {
        expect(error).toEqual(new Error('Notification permissions not granted'));
      }
    });

    expect(notificationService.scheduleSupplementReminder).not.toHaveBeenCalled();
  });

  it('cancels specific reminders', async () => {
    const { result } = renderHook(() => useSupplementReminders());
    const reminderId = 'test-reminder-id';

    await act(async () => {
      await result.current.cancelReminder(reminderId);
    });

    expect(notificationService.cancelSupplementReminder).toHaveBeenCalledWith(reminderId);
  });

  it('updates reminders when app comes to foreground', async () => {
    renderHook(() => useSupplementReminders());

    await act(async () => {
      // Simulate app coming to foreground
      const handler = (AppState as { handler?: (state: string) => void }).handler;
      if (handler) {
        handler('active');
      }
    });

    expect(notificationService.cancelAllSupplementReminders).toHaveBeenCalled();
    expect(notificationService.scheduleSupplementReminder).toHaveBeenCalled();
  });

  it('handles notification responses', async () => {
    const mockResponse: NotificationResponse = {
      notification: {
        request: {
          identifier: '123',
          content: {
            title: 'Test',
            subtitle: null,
            body: 'Test body',
            data: { supplementId: '1' },
            sound: 'default',
          },
          trigger: {
            type: 'timeInterval',
            repeats: true,
            seconds: 3600,
          },
        },
        date: 1635724800000, // Unix timestamp in milliseconds
      },
      actionIdentifier: 'default',
    };

    const consoleSpy = jest.spyOn(console, 'log');
    renderHook(() => useSupplementReminders());

    await act(async () => {
      // Simulate notification response
      const handler = (
        notificationService as { responseHandler?: (response: NotificationResponse) => void }
      ).responseHandler;
      if (handler) {
        handler(mockResponse);
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith('Notification response received for supplement:', '1');
    consoleSpy.mockRestore();
  });

  it('updates reminders when supplements change', async () => {
    const { rerender } = renderHook(() => useSupplementReminders());

    const newSupplements = [
      createMockSupplement({
        id: '2',
        remindersEnabled: true,
        reminderTimes: ['12:00'],
      }),
    ];

    // Update supplements
    (useSupplementStore as jest.Mock).mockReturnValue({ supplements: newSupplements });

    await act(async () => {
      rerender({});
    });

    expect(notificationService.cancelAllSupplementReminders).toHaveBeenCalled();
    expect(notificationService.scheduleSupplementReminder).toHaveBeenCalledWith(
      newSupplements[0],
      '12:00'
    );
  });

  it('cleans up listeners on unmount', () => {
    const appStateRemove = jest.fn();
    const notificationRemove = jest.fn();

    (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: appStateRemove });
    (notificationService.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
      remove: notificationRemove,
    });

    const { unmount } = renderHook(() => useSupplementReminders());

    unmount();

    expect(appStateRemove).toHaveBeenCalled();
    expect(notificationRemove).toHaveBeenCalled();
  });
});
