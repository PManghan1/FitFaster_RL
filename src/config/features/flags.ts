import { FeatureFlags } from '..';

/**
 * Feature flags configuration
 * Controls which features are enabled/disabled across the application
 */
export const featureFlags: FeatureFlags = {
  enableTwoFactor: true,
  enableSocialAuth: true,
  enableOfflineMode: true,
  enablePushNotifications: true,
  enableBetaFeatures: false,
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,
  enableAnalytics: true,
  enableGamification: true,
  enableBackgroundSync: true,
};
