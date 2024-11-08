import { EnvironmentConfig } from '..';

/**
 * Staging environment configuration
 */
export const stagingConfig: EnvironmentConfig = {
  security: {
    passwordHashRounds: 10,
    tokenExpiryHours: 12,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    twoFactorEnabled: true,
    minimumPasswordLength: 10,
  },
  performance: {
    workerPoolSize: {
      min: 3,
      max: 15,
      scaleThreshold: 0.7,
    },
    taskQueue: {
      maxSize: 2000,
      warningThreshold: 0.7,
      staleDuration: 600000,
    },
    monitoring: {
      sampleRate: 0.5,
      metricsInterval: 30000,
      alertThresholds: {
        cpu: 70,
        memory: 75,
        errorRate: 0.02,
      },
    },
  },
  analytics: {
    enabled: true,
    sampleRate: 0.5,
    batchSize: 20,
    flushInterval: 15000,
    errorTracking: {
      enabled: true,
      sampleRate: 1.0,
      maxStackDepth: 15,
    },
  },
  background: {
    maxConcurrentTasks: 8,
    taskTimeout: 600000,
    retryAttempts: 3,
    retryDelay: 10000,
    healthCheck: {
      enabled: true,
      interval: 30000,
    },
  },
  gamification: {
    achievements: {
      enabled: true,
      checkInterval: 30000,
      batchSize: 20,
    },
    leaderboard: {
      updateInterval: 150000,
      cacheTimeout: 300000,
      maxEntries: 200,
    },
    rewards: {
      enabled: true,
      expiryDays: 30,
      reminderDays: 5,
    },
  },
  errors: {
    logging: {
      level: 'info',
      maxFiles: 10,
      maxSize: '20m',
    },
    monitoring: {
      patternThreshold: 5,
      timeWindow: 150000,
      maxPatterns: 200,
    },
    recovery: {
      maxRetries: 5,
      backoffFactor: 2,
      maxTimeout: 60000,
    },
  },
};
