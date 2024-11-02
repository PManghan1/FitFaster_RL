import { z } from 'zod';
import type { PrimaryGoal, SecondaryGoal, WorkoutType } from '../types/goals';

const primaryGoals: PrimaryGoal[] = ['weight-loss', 'muscle-gain', 'endurance', 'flexibility'];
const secondaryGoals: SecondaryGoal[] = ['stress-reduction', 'better-sleep', 'energy-boost'];
const workoutTypes: WorkoutType[] = ['strength', 'cardio', 'hiit', 'yoga'];

export const onboardingGoalsSchema = z.object({
  primaryGoal: z.enum(primaryGoals as [string, ...string[]]),
  secondaryGoals: z.array(z.enum(secondaryGoals as [string, ...string[]])),
  workoutTypes: z.array(z.enum(workoutTypes as [string, ...string[]])),
  workoutsPerWeek: z.number().min(2).max(6),
  workoutDuration: z.number().min(20).max(60),
});
