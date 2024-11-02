import AsyncStorage from '@react-native-async-storage/async-storage';
import { preferencesService } from '../../services/preferences';
import { syncService } from '../../services/sync';
import { errorReporting } from '../../services/error';
import { AppPreferences } from '../../types/preferences';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/sync');
jest.mock('../../services/error');

describe('PreferencesService', () => {
  const mockPreferences: AppPreferences = {
    id: '123',
    user_id: '456',
    theme: {
      colorScheme: 'system',
      fontScale: 1,
      reducedMotion: false,
      highContrast: false,
    },
    workout: {
      defaultRestTime: 60,
      countdownBeforeSet: true,
      autoStartNextSet: false,
      vibrateOnSetComplete: true,
      playSound: true,
      keepScreenAwake: true,
      showPreviousRecords: true,
      unitSystem: 'metric',
      defaultWorkoutDuration: 60,
    },
    nutrition: {
      trackMacros: true,
      trackMicronutrients: false,
      showCaloriesRemaining: true,
      mealReminders: true,
      waterTrackingEnabled: true,
      dailyWaterGoal: 2000,
      preferredMealTimes: {},
      customMealNames: [],
    },
    progressTracking: {
      weeklyGoalReminders: true,
      progressPhotos: true,
      bodyMeasurements: true,
      shareProgress: false,
      progressMetrics: ['weight', 'measurements'],
      preferredChartType: 'line',
    },
    notifications: {
      workoutReminders: true,
      mealTracking: true,
      progressUpdates: true,
      achievements: true,
      friendActivity: true,
      tips: true,
      quietHours: {
        enabled: false,
      },
      notificationSound: 'default',
    },
    social: {
      profileVisibility: 'friends',
      showWorkoutHistory: true,
      showAchievements: true,
      allowFriendRequests: true,
      showInLeaderboards: true,
      autoShareWorkouts: false,
      autoShareAchievements: true,
    },
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Initialization', () => {
    it('loads preferences from storage on initialization', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPreferences));

      const preferences = await preferencesService.getPreferences();
      expect(preferences).toEqual(mockPreferences);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@app_preferences');
    });

    it('handles initialization errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await preferencesService.initialize();
      expect(errorReporting.reportError).toHaveBeenCalled();
    });
  });

  describe('Preference Updates', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPreferences));
      await preferencesService.initialize();
    });

    it('updates theme preferences', async () => {
      const themeUpdates = {
        colorScheme: 'dark' as const,
        fontScale: 1.2,
      };

      await preferencesService.updateThemePreferences(themeUpdates);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@app_preferences',
        expect.stringContaining('"colorScheme":"dark"')
      );
      expect(syncService.queueAction).toHaveBeenCalled();
    });

    it('updates workout preferences', async () => {
      const workoutUpdates = {
        defaultRestTime: 90,
        unitSystem: 'imperial' as const,
      };

      await preferencesService.updateWorkoutPreferences(workoutUpdates);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@app_preferences',
        expect.stringContaining('"defaultRestTime":90')
      );
      expect(syncService.queueAction).toHaveBeenCalled();
    });

    it('updates nutrition preferences', async () => {
      const nutritionUpdates = {
        trackMacros: false,
        dailyWaterGoal: 2500,
      };

      await preferencesService.updateNutritionPreferences(nutritionUpdates);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@app_preferences',
        expect.stringContaining('"dailyWaterGoal":2500')
      );
      expect(syncService.queueAction).toHaveBeenCalled();
    });

    it('validates preferences before updating', async () => {
      const invalidUpdates = {
        theme: {
          colorScheme: 'system' as const,
          fontScale: 5.0, // Invalid: too high
          reducedMotion: false,
          highContrast: false,
        },
      };

      await expect(preferencesService.updatePreferences(invalidUpdates)).rejects.toThrow();
    });
  });

  describe('Preference Reset', () => {
    beforeEach(async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPreferences));
      await preferencesService.initialize();
    });

    it('resets preferences to defaults while maintaining IDs', async () => {
      await preferencesService.resetPreferences();

      const savedPreferences = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);

      expect(savedPreferences.id).toBe(mockPreferences.id);
      expect(savedPreferences.user_id).toBe(mockPreferences.user_id);
      expect(savedPreferences.theme.colorScheme).toBe('system');
      expect(syncService.queueAction).toHaveBeenCalled();
    });
  });

  describe('Subscription Management', () => {
    it('notifies subscribers of preference changes', async () => {
      const subscriber = jest.fn();
      const unsubscribe = preferencesService.subscribe(subscriber);

      await preferencesService.updateThemePreferences({ colorScheme: 'dark' as const });

      expect(subscriber).toHaveBeenCalled();
      expect(subscriber.mock.calls[0][0].theme.colorScheme).toBe('dark');

      unsubscribe();
    });

    it('allows unsubscribing from updates', async () => {
      const subscriber = jest.fn();
      const unsubscribe = preferencesService.subscribe(subscriber);

      unsubscribe();
      await preferencesService.updateThemePreferences({ colorScheme: 'dark' as const });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });
  });
});
