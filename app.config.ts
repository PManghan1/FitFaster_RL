import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
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
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.fitfaster',
    infoPlist: {
      NSFaceIDUsageDescription: 'This app uses Face ID to securely authenticate you.',
      NSCameraUsageDescription:
        'This app uses the camera for scanning QR codes and taking progress photos.',
      NSPhotoLibraryUsageDescription:
        'This app uses the photo library for storing progress photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.yourcompany.fitfaster',
    permissions: [
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  plugins: [
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow FitFaster to use Face ID to authenticate you.',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
  owner: 'your-expo-account',
});
