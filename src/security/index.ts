export {
  SecurityService,
  encryptData,
  decryptData,
  type SecurityEvent,
  SecurityError,
  EncryptionError,
} from './auth/encryption';

export {
  validatePassword,
  passwordValidationSchema,
  enhancedLoginSchema,
  enhancedRegisterSchema,
  type ValidationResult,
  type EnhancedLoginFormData,
  type EnhancedRegisterFormData,
} from './auth/validation';

export {
  securityConfig,
  loadSecurityConfig,
  SECURITY_ENV_VARS,
  type SecurityConfig,
} from './config';
