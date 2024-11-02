import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'fingerprint' | 'facial' | 'iris';

interface BiometricSupport {
  available: boolean;
  biometryType: BiometricType | null;
  enrolled: boolean;
}

export class BiometricService {
  private static instance: BiometricService;
  private supportedTypes: LocalAuthentication.AuthenticationType[] = [];

  private constructor() {}

  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  async checkSupport(): Promise<BiometricSupport> {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      if (!available) {
        return { available: false, biometryType: null, enrolled: false };
      }

      this.supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      let biometryType: BiometricType | null = null;
      if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = 'fingerprint';
      } else if (
        this.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      ) {
        biometryType = 'facial';
      } else if (this.supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometryType = 'iris';
      }

      return { available, biometryType, enrolled };
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return { available: false, biometryType: null, enrolled: false };
    }
  }

  async authenticate(
    options: {
      promptMessage?: string;
      fallbackLabel?: string;
      cancelLabel?: string;
      disableDeviceFallback?: boolean;
    } = {},
  ): Promise<boolean> {
    try {
      const support = await this.checkSupport();
      if (!support.available || !support.enrolled) {
        return false;
      }

      const { promptMessage, fallbackLabel, cancelLabel, disableDeviceFallback } = options;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to continue',
        fallbackLabel: fallbackLabel || 'Use passcode',
        cancelLabel: cancelLabel || 'Cancel',
        disableDeviceFallback: disableDeviceFallback || false,
        requireConfirmation: Platform.OS === 'android',
      });

      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  }

  async getBiometricLabel(): Promise<string> {
    const support = await this.checkSupport();
    switch (support.biometryType) {
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      case 'facial':
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case 'iris':
        return 'Iris Scanner';
      default:
        return 'Biometric Authentication';
    }
  }
}

export const biometricService = BiometricService.getInstance();
