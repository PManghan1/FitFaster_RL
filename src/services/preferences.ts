import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPreferences, appPreferencesSchema } from '../types/preferences';
import { syncService } from './sync';
import { errorReporting, ErrorCategory, ErrorSeverity } from './error';

const PREFERENCES_STORAGE_KEY = '@app_preferences';
const PREFERENCES_TABLE = 'user_preferences';

class PreferencesService {
  private static instance: PreferencesService;
  private preferences: AppPreferences | null = null;
  private subscribers = new Set<(preferences: AppPreferences) => void>();

  private constructor() {}

  static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load preferences from local storage
      const storedPreferences = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (storedPreferences) {
        this.preferences = appPreferencesSchema.parse(JSON.parse(storedPreferences));
        this.notifySubscribers();
      }

      // Sync with server if online
      await this.syncWithServer();
    } catch (error) {
      errorReporting.reportError({
        error: error as Error,
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.MEDIUM,
        timestamp: Date.now(),
      });
    }
  }

  async getPreferences(): Promise<AppPreferences | null> {
    if (!this.preferences) {
      await this.initialize();
    }
    return this.preferences;
  }

  async updatePreferences(updates: Partial<AppPreferences>): Promise<void> {
    try {
      if (!this.preferences) {
        throw new Error('Preferences not initialized');
      }

      // Merge updates with current preferences
      const updatedPreferences = {
        ...this.preferences,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Validate updated preferences
      this.preferences = appPreferencesSchema.parse(updatedPreferences);

      // Save to local storage
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(this.preferences));

      // Queue sync action
      await syncService.queueAction({
        type: 'UPDATE',
        table: PREFERENCES_TABLE,
        data: this.preferences,
      });

      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      errorReporting.reportError({
        error: error as Error,
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.MEDIUM,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  async resetPreferences(): Promise<void> {
    try {
      // Create default preferences using schema defaults
      const defaultPreferences = appPreferencesSchema.parse({
        id: this.preferences?.id,
        user_id: this.preferences?.user_id,
        updated_at: new Date().toISOString(),
      });

      // Update preferences
      await this.updatePreferences(defaultPreferences);
    } catch (error) {
      errorReporting.reportError({
        error: error as Error,
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.MEDIUM,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  subscribe(callback: (preferences: AppPreferences) => void): () => void {
    this.subscribers.add(callback);
    if (this.preferences) {
      callback(this.preferences);
    }
    return () => this.subscribers.delete(callback);
  }

  private async syncWithServer(): Promise<void> {
    try {
      // Get latest preferences from server
      await syncService.queueAction({
        type: 'UPDATE',
        table: PREFERENCES_TABLE,
        data: { user_id: this.preferences?.user_id, fetch: true },
      });
    } catch (error) {
      errorReporting.reportError({
        error: error as Error,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.LOW,
        timestamp: Date.now(),
      });
    }
  }

  private notifySubscribers(): void {
    if (this.preferences) {
      this.subscribers.forEach(callback => callback(this.preferences!));
    }
  }

  // Helper methods for specific preference updates
  async updateThemePreferences(updates: Partial<AppPreferences['theme']>): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.updatePreferences({
        theme: { ...current.theme, ...updates },
      });
    }
  }

  async updateWorkoutPreferences(updates: Partial<AppPreferences['workout']>): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.updatePreferences({
        workout: { ...current.workout, ...updates },
      });
    }
  }

  async updateNutritionPreferences(updates: Partial<AppPreferences['nutrition']>): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.updatePreferences({
        nutrition: { ...current.nutrition, ...updates },
      });
    }
  }

  async updateProgressTrackingPreferences(
    updates: Partial<AppPreferences['progressTracking']>
  ): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.updatePreferences({
        progressTracking: { ...current.progressTracking, ...updates },
      });
    }
  }

  async updateNotificationPreferences(
    updates: Partial<AppPreferences['notifications']>
  ): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.updatePreferences({
        notifications: { ...current.notifications, ...updates },
      });
    }
  }

  async updateSocialPreferences(updates: Partial<AppPreferences['social']>): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.updatePreferences({
        social: { ...current.social, ...updates },
      });
    }
  }
}

export const preferencesService = PreferencesService.getInstance();
