import { z } from 'zod';

// App Theme Preferences
export const themePreferenceSchema = z.object({
  colorScheme: z.enum(['light', 'dark', 'system']).default('system'),
  fontScale: z.number().min(0.8).max(1.4).default(1),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
});

// Workout Preferences
export const workoutPreferenceSchema = z.object({
  defaultRestTime: z.number().min(0).default(60), // seconds
  countdownBeforeSet: z.boolean().default(true),
  autoStartNextSet: z.boolean().default(false),
  vibrateOnSetComplete: z.boolean().default(true),
  playSound: z.boolean().default(true),
  keepScreenAwake: z.boolean().default(true),
  showPreviousRecords: z.boolean().default(true),
  unitSystem: z.enum(['metric', 'imperial']).default('metric'),
  defaultWorkoutDuration: z.number().min(0).default(60), // minutes
});

// Nutrition Preferences
export const nutritionPreferenceSchema = z.object({
  trackMacros: z.boolean().default(true),
  trackMicronutrients: z.boolean().default(false),
  showCaloriesRemaining: z.boolean().default(true),
  mealReminders: z.boolean().default(true),
  waterTrackingEnabled: z.boolean().default(true),
  dailyWaterGoal: z.number().min(0).default(2000), // ml
  preferredMealTimes: z.object({
    breakfast: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    lunch: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    dinner: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
  }),
  customMealNames: z.array(z.string()).default([]),
});

// Progress Tracking Preferences
export const progressTrackingSchema = z.object({
  weeklyGoalReminders: z.boolean().default(true),
  progressPhotos: z.boolean().default(true),
  bodyMeasurements: z.boolean().default(true),
  shareProgress: z.boolean().default(false),
  progressMetrics: z
    .array(
      z.enum([
        'weight',
        'bodyFat',
        'muscleMass',
        'measurements',
        'photos',
        'strength',
        'endurance',
        'flexibility',
      ])
    )
    .default(['weight', 'measurements']),
  preferredChartType: z.enum(['line', 'bar', 'both']).default('line'),
});

// Notification Preferences
export const notificationPreferenceSchema = z.object({
  workoutReminders: z.boolean().default(true),
  mealTracking: z.boolean().default(true),
  progressUpdates: z.boolean().default(true),
  achievements: z.boolean().default(true),
  friendActivity: z.boolean().default(true),
  tips: z.boolean().default(true),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    start: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    end: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
  }),
  notificationSound: z.enum(['default', 'subtle', 'none']).default('default'),
});

// Social Preferences
export const socialPreferenceSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).default('friends'),
  showWorkoutHistory: z.boolean().default(true),
  showAchievements: z.boolean().default(true),
  allowFriendRequests: z.boolean().default(true),
  showInLeaderboards: z.boolean().default(true),
  autoShareWorkouts: z.boolean().default(false),
  autoShareAchievements: z.boolean().default(true),
});

// Combined App Preferences
export const appPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  theme: themePreferenceSchema,
  workout: workoutPreferenceSchema,
  nutrition: nutritionPreferenceSchema,
  progressTracking: progressTrackingSchema,
  notifications: notificationPreferenceSchema,
  social: socialPreferenceSchema,
  updated_at: z.string().datetime(),
});

// Export Types
export type ThemePreference = z.infer<typeof themePreferenceSchema>;
export type WorkoutPreference = z.infer<typeof workoutPreferenceSchema>;
export type NutritionPreference = z.infer<typeof nutritionPreferenceSchema>;
export type ProgressTrackingPreference = z.infer<typeof progressTrackingSchema>;
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;
export type SocialPreference = z.infer<typeof socialPreferenceSchema>;
export type AppPreferences = z.infer<typeof appPreferencesSchema>;
