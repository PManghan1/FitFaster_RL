import { z } from 'zod';

// Health Metrics Schema
export const healthMetricsSchema = z.object({
  height: z.number().min(100).max(300), // cm
  weight: z.number().min(30).max(300), // kg
  age: z.number().min(13).max(120),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
});

// Fitness Level Schema
export const fitnessLevelSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  weeklyActivityFrequency: z.number().min(0).max(7),
  typicalExercises: z.array(z.string()),
  injuryHistory: z.array(z.string()).optional(),
  preferredWorkoutTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
});

// Goal Timeframes Schema
export const goalTimeframesSchema = z.object({
  primaryGoal: z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness']),
  targetDate: z.date(),
  weeklyCommitmentHours: z.number().min(1).max(30),
  milestones: z.array(
    z.object({
      description: z.string(),
      targetDate: z.date(),
    })
  ),
});

// User Consent Schema
export const userConsentSchema = z.object({
  healthDataCollection: z.boolean(),
  thirdPartySharing: z.boolean(),
  marketingCommunications: z.boolean(),
  termsAccepted: z.boolean(),
  privacyPolicyAccepted: z.boolean(),
  dataRetentionAcknowledged: z.boolean(),
});

// Dietary Preferences Schema
export const dietaryPreferencesSchema = z.object({
  dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo']),
  allergies: z.array(z.string()),
  restrictions: z.array(z.string()),
  preferredMeals: z.number().min(1).max(6),
  supplementUse: z.boolean(),
  mealPrepPreference: z.enum(['meal_prep', 'daily_cooking', 'mixed']),
});

// Activity Level Schema
export const activityLevelSchema = z.object({
  dailyActivityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']),
  occupation: z.enum(['desk_job', 'light_physical', 'heavy_physical', 'other']),
  transportationMode: z.enum(['car', 'public_transport', 'bicycle', 'walking', 'mixed']),
  weekendActivityLevel: z.enum(['less_active', 'same_as_weekday', 'more_active']),
});

// Type definitions
export type HealthMetrics = z.infer<typeof healthMetricsSchema>;
export type FitnessLevel = z.infer<typeof fitnessLevelSchema>;
export type GoalTimeframes = z.infer<typeof goalTimeframesSchema>;
export type UserConsent = z.infer<typeof userConsentSchema>;
export type DietaryPreferences = z.infer<typeof dietaryPreferencesSchema>;
export type ActivityLevel = z.infer<typeof activityLevelSchema>;

// Combined Onboarding Data
export type OnboardingData = {
  healthMetrics: HealthMetrics;
  fitnessLevel: FitnessLevel;
  goalTimeframes: GoalTimeframes;
  userConsent: UserConsent;
  dietaryPreferences: DietaryPreferences;
  activityLevel: ActivityLevel;
};

// Navigation types
export type OnboardingStackParamList = {
  Welcome: undefined;
  HealthMetrics: undefined;
  FitnessLevel: undefined;
  GoalTimeframes: undefined;
  UserConsent: undefined;
  DietaryPreferences: undefined;
  ActivityLevel: undefined;
  OnboardingGoals: undefined;
};
