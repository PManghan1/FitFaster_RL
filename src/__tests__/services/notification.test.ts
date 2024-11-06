import { NotificationService } from '../../services/notification';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

type MockDevice = {
  isDevice: boolean;
};

type MockNotifications = {
  setNotificationHandler: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  setNotificationChannelAsync: jest.Mock;
  scheduleNotificationAsync: jest.Mock;
  cancelScheduledNotificationAsync: jest.Mock;
  cancelAllScheduledNotificationsAsync: jest.Mock;
  addNotificationReceivedListener: jest.Mock;
  addNotificationResponseReceivedListener: jest.Mock;
  getBadgeCountAsync: jest.Mock;
  setBadgeCountAsync: jest.Mock;
  getAllScheduledNotificationsAsync: jest.Mock;
  AndroidImportance: { HIGH: number };
};

jest.mock('expo-notifications');
jest.mock('expo-device');

const mockDevice = Device as MockDevice;
const mockNotifications = Notifications as unknown as MockNotifications;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDevice.isDevice = true;
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    NotificationService.getInstance();
  });

  it('configures notification handler', () => {
    expect(mockNotifications.setNotificationHandler).toHaveBeenCalled();
  });

  it('is a singleton', () => {
    const instance1 = NotificationService.getInstance();
    const instance2 = NotificationService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('requestPermissions', () => {
    it('returns denied when not on a device', async () => {
      mockDevice.isDevice = false;
      const service = NotificationService.getInstance();
      const status = await service.requestPermissions();
      expect(status).toBe('denied');
    });
  });
});
