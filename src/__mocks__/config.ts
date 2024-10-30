const config = {
  auth: {
    providers: {
      google: {
        enabled: false,
        clientId: null,
      },
      facebook: {
        enabled: false,
        clientId: null,
      },
      apple: {
        enabled: false,
        clientId: null,
      },
    },
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000,
  },
  supabase: {
    url: 'mock-supabase-url',
    anonKey: 'mock-supabase-key',
  },
};

export const validateConfig = () => true;

export default config;
