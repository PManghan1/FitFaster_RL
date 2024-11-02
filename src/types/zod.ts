import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);
export const nameSchema = z.string().min(2);

// User schema
export const userSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

// Workout schema
export const workoutSchema = z.object({
  name: z.string(),
  duration: z.number(),
  exercises: z.array(
    z.object({
      name: z.string(),
      sets: z.number(),
      reps: z.number(),
      weight: z.number().optional(),
    }),
  ),
});

// Nutrition schema
export const nutritionSchema = z.object({
  meal: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
});

export type User = z.infer<typeof userSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type Nutrition = z.infer<typeof nutritionSchema>;
