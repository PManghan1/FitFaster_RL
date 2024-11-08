/**
 * Security configuration
 */
export interface SecurityConfig {
  passwordHashRounds: number;
  tokenExpiryHours: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  twoFactorEnabled: boolean;
  minimumPasswordLength: number;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  workerPoolSize: {
    min: number;
    max: number;
    scaleThreshold: number;
  };
  taskQueue: {
    maxSize: number;
    warningThreshold: number;
    staleDuration: number;
  };
  monitoring: {
    sampleRate: number;
    metricsInterval: number;
    alertThresholds: {
      cpu: number;
      memory: number;
      errorRate: number;
    };
  };
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  batchSize: number;
  flushInterval: number;
  errorTracking: {
    enabled: boolean;
    sampleRate: number;
    maxStackDepth: number;
  };
}

/**
 * Background service configuration
 */
export interface BackgroundConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  healthCheck: {
    enabled: boolean;
    interval: number;
  };
}

/**
 * Gamification configuration
 */
export interface GamificationConfig {
  achievements: {
    enabled: boolean;
    checkInterval: number;
    batchSize: number;
  };
  leaderboard: {
    updateInterval: number;
    cacheTimeout: number;
    maxEntries: number;
  };
  rewards: {
    enabled: boolean;
    expiryDays: number;
    reminderDays: number;
  };
}

/**
 * Error handling configuration
 */
export interface ErrorConfig {
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    maxFiles: number;
    maxSize: string;
  };
  monitoring: {
    patternThreshold: number;
    timeWindow: number;
    maxPatterns: number;
  };
  recovery: {
    maxRetries: number;
    backoffFactor: number;
    maxTimeout: number;
  };
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  security: SecurityConfig;
  performance: PerformanceConfig;
  analytics: AnalyticsConfig;
  background: BackgroundConfig;
  gamification: GamificationConfig;
  errors: ErrorConfig;
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  enableTwoFactor: boolean;
  enableSocialAuth: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableBetaFeatures: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableAnalytics: boolean;
  enableGamification: boolean;
  enableBackgroundSync: boolean;
}

/**
 * Feature toggles configuration
 */
export interface FeatureToggles {
  newAuthFlow: boolean;
  newProfilePage: boolean;
  enhancedAnalytics: boolean;
  improvedErrorHandling: boolean;
  optimizedBackgroundTasks: boolean;
  advancedGamification: boolean;
  betaFeatures: {
    newWorkoutPlanner: boolean;
    aiAssistant: boolean;
    socialFeatures: boolean;
    customizableMetrics: boolean;
  };
}

/**
 * Complete configuration type
 */
export interface AppConfig {
  env: EnvironmentConfig;
  features: FeatureFlags;
  toggles: FeatureToggles;
}
