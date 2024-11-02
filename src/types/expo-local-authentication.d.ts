declare module 'expo-local-authentication' {
  export enum AuthenticationType {
    FINGERPRINT = 1,
    FACIAL_RECOGNITION = 2,
    IRIS = 3,
  }

  export interface LocalAuthenticationOptions {
    promptMessage?: string;
    fallbackLabel?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
    requireConfirmation?: boolean;
  }

  export interface AuthenticationResult {
    success: boolean;
    error?: string;
    warning?: string;
  }

  export function hasHardwareAsync(): Promise<boolean>;
  export function supportedAuthenticationTypesAsync(): Promise<AuthenticationType[]>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(
    options?: LocalAuthenticationOptions,
  ): Promise<AuthenticationResult>;
  export function cancelAuthenticate(): void;
}
