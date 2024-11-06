import { z } from 'zod';

// Frequency types for supplement intake
export const supplementFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'as_needed']);

export type SupplementFrequency = z.infer<typeof supplementFrequencySchema>;

// Unit types for supplement dosage
export const supplementUnitSchema = z.enum([
  'mg',
  'g',
  'mcg',
  'ml',
  'capsule',
  'tablet',
  'scoop',
  'serving',
]);

export type SupplementUnit = z.infer<typeof supplementUnitSchema>;

// Schema for supplement definition
export const supplementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  dosage: z.number().positive('Dosage must be positive'),
  unit: supplementUnitSchema,
  frequency: supplementFrequencySchema,
  startDate: z.date(),
  endDate: z.date().optional(),
  remindersEnabled: z.boolean(),
  reminderTimes: z.array(z.string()), // Time strings in 24h format (HH:mm)
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Supplement = z.infer<typeof supplementSchema>;

// Schema for supplement intake records
export const supplementIntakeSchema = z.object({
  id: z.string().uuid(),
  supplementId: z.string().uuid(),
  intakeDateTime: z.date(),
  dosageTaken: z.number().positive(),
  notes: z.string().optional(),
  createdAt: z.date(),
});

export type SupplementIntake = z.infer<typeof supplementIntakeSchema>;

// Schema for supplement reminders
export const supplementReminderSchema = z.object({
  id: z.string().uuid(),
  supplementId: z.string().uuid(),
  scheduledTime: z.string(), // Time in 24h format (HH:mm)
  enabled: z.boolean(),
  lastTriggered: z.date().optional(),
  nextTrigger: z.date(),
});

export type SupplementReminder = z.infer<typeof supplementReminderSchema>;

// Schema for supplement statistics
export const supplementStatsSchema = z.object({
  supplementId: z.string().uuid(),
  totalIntakes: z.number(),
  adherenceRate: z.number(), // Percentage of scheduled intakes taken
  lastIntake: z.date().optional(),
  streakDays: z.number(),
});

export type SupplementStats = z.infer<typeof supplementStatsSchema>;

// Types for supplement-related errors
export type SupplementError = {
  code: string;
  message: string;
  field?: string;
};

// Types for supplement filter options
export const supplementFilterSchema = z.object({
  active: z.boolean().optional(),
  frequency: supplementFrequencySchema.optional(),
  reminderStatus: z.enum(['enabled', 'disabled']).optional(),
  startDateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
});

export type SupplementFilter = z.infer<typeof supplementFilterSchema>;

// Types for supplement sort options
export const supplementSortSchema = z.enum([
  'name_asc',
  'name_desc',
  'created_asc',
  'created_desc',
  'next_intake_asc',
  'next_intake_desc',
]);

export type SupplementSort = z.infer<typeof supplementSortSchema>;
