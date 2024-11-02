import Constants from 'expo-constants';

// Environment variables from Expo config
const extra = Constants.expoConfig?.extra;

if (!extra?.supabaseUrl || !extra?.supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file',
  );
}

// Generate a secure encryption key (in production, this should come from secure storage)
const generateEncryptionKey = () => {
  if (process.env.EXPO_PUBLIC_ENCRYPTION_KEY) {
    return process.env.EXPO_PUBLIC_ENCRYPTION_KEY;
  }
  // For development only - in production, use a proper key management system
  return 'development-encryption-key-do-not-use-in-production';
};

type SocialProviderWithClientId = {
  enabled: true;
  clientId: string;
};

type SocialProviderWithoutClientId = {
  enabled: true;
};

type AuthProviders = {
  google: SocialProviderWithClientId;
  apple: SocialProviderWithoutClientId;
  facebook: SocialProviderWithClientId;
};

export const config = {
  supabase: {
    url: extra.supabaseUrl as string,
    anonKey: extra.supabaseAnonKey as string,
  },
  sentry: {
    dsn: extra.sentryDsn as string, // Add Sentry DSN from environment variables
  },
  environment: (extra.appEnv as string) || 'development',
  version: Constants.expoConfig?.version || '1.0.0',
  isProduction: extra.appEnv === 'production',
  isDevelopment: extra.appEnv === 'development',
  appUrl: extra.appUrl || 'exp://localhost:19000',
  auth: {
    redirectUrl: extra.authRedirectUrl || 'exp://localhost:19000/auth/callback',
    providers: {
      google: {
        enabled: true,
        clientId: extra.googleClientId as string,
      },
      apple: {
        enabled: true,
      },
      facebook: {
        enabled: true,
        clientId: extra.facebookClientId as string,
      },
    } satisfies AuthProviders,
  },
  security: {
    encryptionKey: generateEncryptionKey(),
    dataRetentionDays: 730, // 2 years
    maxLoginAttempts: 5,
    passwordMinLength: 12,
    sessionTimeout: 3600, // 1 hour in seconds
    requireMFA: false,
    allowedOrigins: ['exp://localhost:19000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // limit each IP to 100 requests per windowMs
    },
  },
  gdpr: {
    defaultConsentDuration: 365, // days
    retentionPeriods: {
      userProfile: 730, // days
      activityLogs: 90, // days
      analyticsData: 365, // days
    },
    dataCategories: {
      essential: 'ESSENTIAL',
      health: 'HEALTH',
      preferences: 'PREFERENCES',
      marketing: 'MARKETING',
    },
  },
} as const;

// Type for the config object
export type Config = typeof config;

// Helper function to check if we're in development
export const isDev = () => config.environment === 'development';

// Helper function to check if we're in production
export const isProd = () => config.environment === 'production';

// Helper function to check if a social provider is enabled
export const isProviderEnabled = (provider: keyof AuthProviders) => {
  return config.auth.providers[provider]?.enabled;
};

// Helper function to get provider client ID
export const getProviderClientId = (
  provider: Extract<keyof AuthProviders, 'google' | 'facebook'>,
) => {
  const providerConfig = config.auth.providers[provider] as SocialProviderWithClientId;
  return providerConfig.clientId;
};

// Validate the configuration
const validateConfig = () => {
  const requiredKeys: (keyof typeof config)[] = ['supabase', 'sentry', 'environment', 'appUrl'];

  for (const key of requiredKeys) {
    const value = config[key];
    if (!value) {
      throw new Error(`Missing required config key: ${key}`);
    }
  }

  // Validate enabled social providers have required configuration
  const providers = config.auth.providers;
  if (providers.google.enabled && !providers.google.clientId) {
    throw new Error('Google authentication is enabled but clientId is missing');
  }
  if (providers.facebook.enabled && !providers.facebook.clientId) {
    throw new Error('Facebook authentication is enabled but clientId is missing');
  }

  // Validate security settings
  if (!config.security.encryptionKey) {
    throw new Error('Encryption key is required');
  }
};

// Run validation
validateConfig();

export default config;
