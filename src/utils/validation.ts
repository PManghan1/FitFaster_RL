import { z } from 'zod';
import type {
  HealthMetrics,
  FitnessLevel,
  GoalTimeframes,
  UserConsent,
  DietaryPreferences,
  ActivityLevel,
} from '../types/onboarding';

export const handleValidationError = (error: z.ZodError) => {
  return error.errors.reduce((acc: Record<string, string>, curr) => {
    const path = curr.path.join('.');
    acc[path] = curr.message;
    return acc;
  }, {});
};

export const validateOnboardingData = (
  data: Partial<{
    healthMetrics: HealthMetrics;
    fitnessLevel: FitnessLevel;
    goalTimeframes: GoalTimeframes;
    userConsent: UserConsent;
    dietaryPreferences: DietaryPreferences;
    activityLevel: ActivityLevel;
  }>
) => {
  const errors: Record<string, Record<string, string>> = {};

  // Validate each section if present
  Object.entries(data).forEach(([key, value]) => {
    try {
      switch (key) {
        case 'healthMetrics':
          z.object({ healthMetrics: healthMetricsSchema }).parse({ healthMetrics: value });
          break;
        case 'fitnessLevel':
          z.object({ fitnessLevel: fitnessLevelSchema }).parse({ fitnessLevel: value });
          break;
        case 'goalTimeframes':
          z.object({ goalTimeframes: goalTimeframesSchema }).parse({ goalTimeframes: value });
          break;
        case 'userConsent':
          z.object({ userConsent: userConsentSchema }).parse({ userConsent: value });
          break;
        case 'dietaryPreferences':
          z.object({ dietaryPreferences: dietaryPreferencesSchema }).parse({
            dietaryPreferences: value,
          });
          break;
        case 'activityLevel':
          z.object({ activityLevel: activityLevelSchema }).parse({ activityLevel: value });
          break;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors[key] = handleValidationError(error);
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatValidationError = (error: string): string => {
  // Convert camelCase to sentence case and make error messages more user-friendly
  return error
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/\./g, ' ')
    .trim();
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return error.errors.map(err => formatValidationError(err.message)).join('. ');
  }
  if (error instanceof Error) {
    return formatValidationError(error.message);
  }
  return 'An unexpected error occurred';
};
