import { AppConfig } from './types';
import { developmentConfig } from './env/development';
import { stagingConfig } from './env/staging';
import { productionConfig } from './env/production';
import { featureFlags } from './features/flags';
import { featureToggles } from './features/toggles';
import { appConfigSchema } from './validation/schema';
import {
  defaultEnvironmentConfig,
  defaultFeatureFlags,
  defaultFeatureToggles,
} from './validation/defaults';

// Re-export all types and configurations
export * from './types';
export * from './env/development';
export * from './env/staging';
export * from './env/production';
export * from './features/flags';
export * from './features/toggles';
export * from './validation/schema';
export * from './validation/defaults';

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig() {
  switch (process.env.NODE_ENV) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    default:
      return developmentConfig;
  }
}

/**
 * Create application configuration
 */
export function createConfig(): AppConfig {
  const config = {
    env: getEnvironmentConfig(),
    features: featureFlags,
    toggles: featureToggles,
  };

  // Validate configuration
  const result = appConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.message}`);
  }

  return config;
}

/**
 * Application configuration instance
 */
export const config = createConfig();

/**
 * Default configurations
 */
export const defaults = {
  env: defaultEnvironmentConfig,
  features: defaultFeatureFlags,
  toggles: defaultFeatureToggles,
};

/**
 * Configuration validation
 */
export function validateConfig(config: Partial<AppConfig>): boolean {
  const result = appConfigSchema.safeParse(config);
  return result.success;
}

/**
 * Get merged configuration with defaults
 */
export function getMergedConfig(overrides: Partial<AppConfig>): AppConfig {
  return {
    env: { ...defaultEnvironmentConfig, ...overrides.env },
    features: { ...defaultFeatureFlags, ...overrides.features },
    toggles: {
      ...defaultFeatureToggles,
      ...overrides.toggles,
      betaFeatures: {
        ...defaultFeatureToggles.betaFeatures,
        ...overrides.toggles?.betaFeatures,
      },
    },
  };
}

/**
 * Configuration utilities
 */
export const configUtils = {
  validateConfig,
  getMergedConfig,
  getEnvironmentConfig,
};

export default config;
