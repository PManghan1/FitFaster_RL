import { z } from 'zod';

// Enhanced password validation schema
export const passwordValidationSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Validation error types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @returns ValidationResult with validation status and any error messages
 */
export const validatePassword = (password: string): ValidationResult => {
  const result = passwordValidationSchema.safeParse(password);

  if (result.success) {
    return { isValid: true, errors: [] };
  }

  return {
    isValid: false,
    errors: result.error.errors.map(err => err.message),
  };
};

// Re-export existing auth schemas with enhanced password validation
export const enhancedLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordValidationSchema,
});

export const enhancedRegisterSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: passwordValidationSchema,
    confirmPassword: passwordValidationSchema,
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type EnhancedLoginFormData = z.infer<typeof enhancedLoginSchema>;
export type EnhancedRegisterFormData = z.infer<typeof enhancedRegisterSchema>;
