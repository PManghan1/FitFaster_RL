import { EnvironmentConfig, FeatureFlags, FeatureToggles } from '..';

/**
 * Default environment configuration
 * Provides safe fallback values for all configuration options
 */
export const defaultEnvironmentConfig: EnvironmentConfig = {
  security: {
    passwordHashRounds: 10,
    tokenExpiryHours: 24,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    twoFactorEnabled: false,
    minimumPasswordLength: 8,
  },
  performance: {
    workerPoolSize: {
      min: 2,
      max: 10,
      scaleThreshold: 0.8,
    },
    taskQueue: {
      maxSize: 1000,
      warningThreshold: 0.8,
      staleDuration: 300000,
    },
    monitoring: {
      sampleRate: 0.1,
      metricsInterval: 60000,
      alertThresholds: {
        cpu: 80,
        memory: 85,
        errorRate: 0.05,
      },
    },
  },
  analytics: {
    enabled: true,
    sampleRate: 1.0,
    batchSize: 10,
    flushInterval: 30000,
    errorTracking: {
      enabled: true,
      sampleRate: 1.0,
      maxStackDepth: 10,
    },
  },
  background: {
    maxConcurrentTasks: 5,
    taskTimeout: 300000,
    retryAttempts: 3,
    retryDelay: 5000,
    healthCheck: {
      enabled: true,
      interval: 60000,
    },
  },
  gamification: {
    achievements: {
      enabled: true,
      checkInterval: 60000,
      batchSize: 10,
    },
    leaderboard: {
      updateInterval: 300000,
      cacheTimeout: 600000,
      maxEntries: 100,
    },
    rewards: {
      enabled: true,
      expiryDays: 30,
      reminderDays: 7,
    },
  },
  errors: {
    logging: {
      level: 'debug',
      maxFiles: 5,
      maxSize: '10m',
    },
    monitoring: {
      patternThreshold: 10,
      timeWindow: 300000,
      maxPatterns: 100,
    },
    recovery: {
      maxRetries: 3,
      backoffFactor: 1.5,
      maxTimeout: 30000,
    },
  },
};

/**
 * Default feature flags
 * Conservative defaults for feature enablement
 */
export const defaultFeatureFlags: FeatureFlags = {
  enableTwoFactor: false,
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

/**
 * Default feature toggles
 * Conservative defaults for experimental features
 */
export const defaultFeatureToggles: FeatureToggles = {
  newAuthFlow: false,
  newProfilePage: false,
  enhancedAnalytics: false,
  improvedErrorHandling: false,
  optimizedBackgroundTasks: false,
  advancedGamification: false,
  betaFeatures: {
    newWorkoutPlanner: false,
    aiAssistant: false,
    socialFeatures: false,
    customizableMetrics: false,
  },
};
