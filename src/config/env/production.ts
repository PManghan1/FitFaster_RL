import { EnvironmentConfig } from '..';

/**
 * Production environment configuration
 */
export const productionConfig: EnvironmentConfig = {
  security: {
    passwordHashRounds: 12,
    tokenExpiryHours: 8,
    maxLoginAttempts: 3,
    lockoutDurationMinutes: 60,
    twoFactorEnabled: true,
    minimumPasswordLength: 12,
  },
  performance: {
    workerPoolSize: {
      min: 5,
      max: 20,
      scaleThreshold: 0.6,
    },
    taskQueue: {
      maxSize: 5000,
      warningThreshold: 0.6,
      staleDuration: 900000,
    },
    monitoring: {
      sampleRate: 1.0,
      metricsInterval: 15000,
      alertThresholds: {
        cpu: 60,
        memory: 70,
        errorRate: 0.01,
      },
    },
  },
  analytics: {
    enabled: true,
    sampleRate: 0.2,
    batchSize: 50,
    flushInterval: 10000,
    errorTracking: {
      enabled: true,
      sampleRate: 0.5,
      maxStackDepth: 20,
    },
  },
  background: {
    maxConcurrentTasks: 12,
    taskTimeout: 900000,
    retryAttempts: 5,
    retryDelay: 15000,
    healthCheck: {
      enabled: true,
      interval: 15000,
    },
  },
  gamification: {
    achievements: {
      enabled: true,
      checkInterval: 15000,
      batchSize: 50,
    },
    leaderboard: {
      updateInterval: 60000,
      cacheTimeout: 120000,
      maxEntries: 500,
    },
    rewards: {
      enabled: true,
      expiryDays: 45,
      reminderDays: 3,
    },
  },
  errors: {
    logging: {
      level: 'warn',
      maxFiles: 20,
      maxSize: '50m',
    },
    monitoring: {
      patternThreshold: 3,
      timeWindow: 60000,
      maxPatterns: 500,
    },
    recovery: {
      maxRetries: 7,
      backoffFactor: 2.5,
      maxTimeout: 120000,
    },
  },
};
