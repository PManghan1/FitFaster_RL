import { z } from 'zod';

/**
 * Security configuration schema
 */
export const securityConfigSchema = z.object({
  passwordHashRounds: z.number().min(10).max(14),
  tokenExpiryHours: z.number().min(1).max(24),
  maxLoginAttempts: z.number().min(1).max(10),
  lockoutDurationMinutes: z.number().min(5).max(60),
  twoFactorEnabled: z.boolean(),
  minimumPasswordLength: z.number().min(8).max(32),
});

/**
 * Performance configuration schema
 */
export const performanceConfigSchema = z.object({
  workerPoolSize: z.object({
    min: z.number().min(1),
    max: z.number().min(5),
    scaleThreshold: z.number().min(0.1).max(1),
  }),
  taskQueue: z.object({
    maxSize: z.number().min(100),
    warningThreshold: z.number().min(0.1).max(1),
    staleDuration: z.number().min(60000),
  }),
  monitoring: z.object({
    sampleRate: z.number().min(0.01).max(1),
    metricsInterval: z.number().min(5000),
    alertThresholds: z.object({
      cpu: z.number().min(1).max(100),
      memory: z.number().min(1).max(100),
      errorRate: z.number().min(0.001).max(1),
    }),
  }),
});

/**
 * Analytics configuration schema
 */
export const analyticsConfigSchema = z.object({
  enabled: z.boolean(),
  sampleRate: z.number().min(0.01).max(1),
  batchSize: z.number().min(1).max(100),
  flushInterval: z.number().min(5000),
  errorTracking: z.object({
    enabled: z.boolean(),
    sampleRate: z.number().min(0.01).max(1),
    maxStackDepth: z.number().min(5).max(50),
  }),
});

/**
 * Background configuration schema
 */
export const backgroundConfigSchema = z.object({
  maxConcurrentTasks: z.number().min(1).max(20),
  taskTimeout: z.number().min(60000),
  retryAttempts: z.number().min(1).max(10),
  retryDelay: z.number().min(1000),
  healthCheck: z.object({
    enabled: z.boolean(),
    interval: z.number().min(5000),
  }),
});

/**
 * Gamification configuration schema
 */
export const gamificationConfigSchema = z.object({
  achievements: z.object({
    enabled: z.boolean(),
    checkInterval: z.number().min(5000),
    batchSize: z.number().min(1).max(100),
  }),
  leaderboard: z.object({
    updateInterval: z.number().min(30000),
    cacheTimeout: z.number().min(60000),
    maxEntries: z.number().min(50).max(1000),
  }),
  rewards: z.object({
    enabled: z.boolean(),
    expiryDays: z.number().min(1).max(90),
    reminderDays: z.number().min(1).max(30),
  }),
});

/**
 * Error configuration schema
 */
export const errorConfigSchema = z.object({
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    maxFiles: z.number().min(1).max(50),
    maxSize: z.string().regex(/^\d+[kmg]$/i),
  }),
  monitoring: z.object({
    patternThreshold: z.number().min(1).max(1000),
    timeWindow: z.number().min(30000),
    maxPatterns: z.number().min(50).max(1000),
  }),
  recovery: z.object({
    maxRetries: z.number().min(1).max(10),
    backoffFactor: z.number().min(1).max(5),
    maxTimeout: z.number().min(1000),
  }),
});

/**
 * Environment configuration schema
 */
export const environmentConfigSchema = z.object({
  security: securityConfigSchema,
  performance: performanceConfigSchema,
  analytics: analyticsConfigSchema,
  background: backgroundConfigSchema,
  gamification: gamificationConfigSchema,
  errors: errorConfigSchema,
});

/**
 * Feature flags schema
 */
export const featureFlagsSchema = z.object({
  enableTwoFactor: z.boolean(),
  enableSocialAuth: z.boolean(),
  enableOfflineMode: z.boolean(),
  enablePushNotifications: z.boolean(),
  enableBetaFeatures: z.boolean(),
  enablePerformanceMonitoring: z.boolean(),
  enableErrorTracking: z.boolean(),
  enableAnalytics: z.boolean(),
  enableGamification: z.boolean(),
  enableBackgroundSync: z.boolean(),
});

/**
 * Feature toggles schema
 */
export const featureTogglesSchema = z.object({
  newAuthFlow: z.boolean(),
  newProfilePage: z.boolean(),
  enhancedAnalytics: z.boolean(),
  improvedErrorHandling: z.boolean(),
  optimizedBackgroundTasks: z.boolean(),
  advancedGamification: z.boolean(),
  betaFeatures: z.object({
    newWorkoutPlanner: z.boolean(),
    aiAssistant: z.boolean(),
    socialFeatures: z.boolean(),
    customizableMetrics: z.boolean(),
  }),
});

/**
 * Complete configuration schema
 */
export const appConfigSchema = z.object({
  env: environmentConfigSchema,
  features: featureFlagsSchema,
  toggles: featureTogglesSchema,
});
