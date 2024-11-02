import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'FitFaster',
  slug: 'fitfaster',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-project-id',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.fitfaster',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.yourcompany.fitfaster',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
  plugins: [
    'expo-router',
    [
      'expo-barcode-scanner',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access camera.',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.',
      },
    ],
  ],
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  sdkVersion: '51.0.0',
};

export default config;
