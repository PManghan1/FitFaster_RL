import { useEffect, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { notificationService } from '../services/notification';
import useSupplementStore from '../store/supplement.store';
import type { Supplement } from '../types/supplement';
import type { NotificationPermissionStatus } from '../services/notification';

export const useSupplementReminders = () => {
  const { supplements } = useSupplementStore();
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');

  const requestPermissions = useCallback(async () => {
    const status = await notificationService.requestPermissions();
    setPermissionStatus(status);
    return status;
  }, []);

  const scheduleReminder = useCallback(
    async (supplement: Supplement, time: string) => {
      if (permissionStatus !== 'granted') {
        const status = await requestPermissions();
        if (status !== 'granted') {
          throw new Error('Notification permissions not granted');
        }
      }

      return await notificationService.scheduleSupplementReminder(supplement, time);
    },
    [permissionStatus, requestPermissions]
  );

  const cancelReminder = useCallback(async (identifier: string) => {
    await notificationService.cancelSupplementReminder(identifier);
  }, []);

  const updateReminders = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      return;
    }

    // Cancel all existing reminders
    await notificationService.cancelAllSupplementReminders();

    // Schedule new reminders for all supplements
    for (const supplement of supplements) {
      if (supplement.remindersEnabled) {
        for (const time of supplement.reminderTimes) {
          await scheduleReminder(supplement, time);
        }
      }
    }
  }, [supplements, permissionStatus, scheduleReminder]);

  // Handle notification responses
  useEffect(() => {
    const subscription = notificationService.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && typeof data === 'object' && 'supplementId' in data) {
        // Handle notification response
        console.log('Notification response received for supplement:', data.supplementId);
      }
    });

    return () => subscription.remove();
  }, []);

  // Update reminders when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        updateReminders();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [updateReminders]);

  // Initial setup
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Update reminders when supplements change
  useEffect(() => {
    updateReminders();
  }, [supplements, updateReminders]);

  return {
    permissionStatus,
    requestPermissions,
    scheduleReminder,
    cancelReminder,
    updateReminders,
  };
};
