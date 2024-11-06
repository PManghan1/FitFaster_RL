import { z } from 'zod';

// Validation schema for security configuration
const securityConfigSchema = z.object({
  encryptionKey: z.string().min(32, 'Encryption key must be at least 32 characters'),
  maxLoginAttempts: z.number().min(1).max(10),
  passwordMinLength: z.number().min(12),
  sessionTimeout: z.number().min(300), // minimum 5 minutes in seconds
  twoFactorEnabled: z.boolean(),
  dataRetentionDays: z.number().min(1),
});

// Environment variable names for security settings
export const SECURITY_ENV_VARS = {
  ENCRYPTION_KEY: 'FITFASTER_ENCRYPTION_KEY',
  MAX_LOGIN_ATTEMPTS: 'FITFASTER_MAX_LOGIN_ATTEMPTS',
  PASSWORD_MIN_LENGTH: 'FITFASTER_PASSWORD_MIN_LENGTH',
  SESSION_TIMEOUT: 'FITFASTER_SESSION_TIMEOUT',
  TWO_FACTOR_ENABLED: 'FITFASTER_TWO_FACTOR_ENABLED',
  DATA_RETENTION_DAYS: 'FITFASTER_DATA_RETENTION_DAYS',
} as const;

// Default values for non-sensitive settings
const DEFAULT_CONFIG = {
  maxLoginAttempts: 5,
  passwordMinLength: 12,
  sessionTimeout: 3600, // 1 hour
  twoFactorEnabled: true,
  dataRetentionDays: 730, // 2 years
} as const;

// Helper to get environment variables with type safety
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value ?? defaultValue ?? '';
};

// Load and validate security configuration
export const loadSecurityConfig = () => {
  const config = {
    encryptionKey: getEnvVar(SECURITY_ENV_VARS.ENCRYPTION_KEY),
    maxLoginAttempts: Number(
      getEnvVar(SECURITY_ENV_VARS.MAX_LOGIN_ATTEMPTS, DEFAULT_CONFIG.maxLoginAttempts.toString())
    ),
    passwordMinLength: Number(
      getEnvVar(SECURITY_ENV_VARS.PASSWORD_MIN_LENGTH, DEFAULT_CONFIG.passwordMinLength.toString())
    ),
    sessionTimeout: Number(
      getEnvVar(SECURITY_ENV_VARS.SESSION_TIMEOUT, DEFAULT_CONFIG.sessionTimeout.toString())
    ),
    twoFactorEnabled:
      getEnvVar(
        SECURITY_ENV_VARS.TWO_FACTOR_ENABLED,
        DEFAULT_CONFIG.twoFactorEnabled.toString()
      ) === 'true',
    dataRetentionDays: Number(
      getEnvVar(SECURITY_ENV_VARS.DATA_RETENTION_DAYS, DEFAULT_CONFIG.dataRetentionDays.toString())
    ),
  };

  // Validate configuration
  const result = securityConfigSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Invalid security configuration: ${result.error.message}`);
  }

  return result.data;
};

// Type for the security configuration
export type SecurityConfig = z.infer<typeof securityConfigSchema>;

// Export validated configuration
export const securityConfig = loadSecurityConfig();
