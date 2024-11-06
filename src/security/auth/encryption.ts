import { createClient, AuthError } from '@supabase/supabase-js';
import { AES, enc } from 'crypto-js';
import { validatePassword } from './validation';
import type { ValidationResult } from './validation';

// Types for security events
export interface SecurityEvent {
  type: 'login_attempt' | 'password_change' | 'data_encryption' | 'data_decryption';
  success: boolean;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// Error types
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

// Security event logging
const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  // In production, this should write to a secure audit log
  console.info(
    JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    })
  );
};

/**
 * Encrypts sensitive data using AES encryption
 * @param data - Data to encrypt
 * @param encryptionKey - Encryption key from environment variables
 * @returns Encrypted data string
 */
export const encryptData = (data: unknown, encryptionKey: string): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = AES.encrypt(jsonString, encryptionKey).toString();

    void logSecurityEvent({
      type: 'data_encryption',
      success: true,
      timestamp: new Date().toISOString(),
    });

    return encrypted;
  } catch (error) {
    void logSecurityEvent({
      type: 'data_encryption',
      success: false,
      timestamp: new Date().toISOString(),
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    throw new EncryptionError('Failed to encrypt data');
  }
};

/**
 * Decrypts encrypted data using AES decryption
 * @param encryptedData - Encrypted data string
 * @param encryptionKey - Encryption key from environment variables
 * @returns Decrypted data
 */
export const decryptData = <T>(encryptedData: string, encryptionKey: string): T => {
  try {
    const decrypted = AES.decrypt(encryptedData, encryptionKey).toString(enc.Utf8);
    const parsed = JSON.parse(decrypted) as T;

    void logSecurityEvent({
      type: 'data_decryption',
      success: true,
      timestamp: new Date().toISOString(),
    });

    return parsed;
  } catch (error) {
    void logSecurityEvent({
      type: 'data_decryption',
      success: false,
      timestamp: new Date().toISOString(),
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    throw new EncryptionError('Failed to decrypt data');
  }
};

/**
 * Enhanced security service that wraps Supabase auth and adds additional security features
 */
export class SecurityService {
  private loginAttempts: Map<string, number> = new Map();
  private readonly maxLoginAttempts: number;

  constructor(
    private readonly supabase: ReturnType<typeof createClient>,
    private readonly encryptionKey: string,
    maxAttempts = 5
  ) {
    this.maxLoginAttempts = maxAttempts;
  }

  /**
   * Validates password and returns validation result
   * @param password - Password to validate
   * @returns ValidationResult containing validation status and any errors
   */
  private validatePasswordWithResult(password: string): ValidationResult {
    const validation = validatePassword(password);
    if (!validation.isValid) {
      void logSecurityEvent({
        type: 'login_attempt',
        success: false,
        timestamp: new Date().toISOString(),
        metadata: { reason: 'password_validation_failed', errors: validation.errors },
      });
    }
    return validation;
  }

  /**
   * Enhanced sign in with additional security checks and logging
   */
  async signIn(email: string, password: string) {
    const attempts = this.loginAttempts.get(email) || 0;

    if (attempts >= this.maxLoginAttempts) {
      await logSecurityEvent({
        type: 'login_attempt',
        success: false,
        timestamp: new Date().toISOString(),
        metadata: { reason: 'max_attempts_exceeded', email },
      });

      throw new SecurityError('Account temporarily locked due to too many failed attempts');
    }

    try {
      const validation = this.validatePasswordWithResult(password);
      if (!validation.isValid) {
        throw new SecurityError(validation.errors.join(', '));
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.loginAttempts.set(email, attempts + 1);
        throw error;
      }

      // Reset attempts on successful login
      this.loginAttempts.delete(email);

      await logSecurityEvent({
        type: 'login_attempt',
        success: true,
        timestamp: new Date().toISOString(),
        userId: data.user?.id,
      });

      return { data, error: null };
    } catch (error) {
      await logSecurityEvent({
        type: 'login_attempt',
        success: false,
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          email,
        },
      });

      if (error instanceof AuthError) {
        return { data: null, error };
      }
      throw error;
    }
  }

  /**
   * Encrypts sensitive health data
   */
  encryptHealthData<T extends Record<string, unknown>>(data: T) {
    return encryptData(data, this.encryptionKey);
  }

  /**
   * Decrypts sensitive health data
   */
  decryptHealthData<T>(encryptedData: string): T {
    return decryptData<T>(encryptedData, this.encryptionKey);
  }

  /**
   * Resets failed login attempts for an email
   */
  resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }
}
