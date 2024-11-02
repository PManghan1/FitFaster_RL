import { NutritionEventType, WorkoutEventType } from './analytics';

export type SupabaseEvent = WorkoutEventType | NutritionEventType;

export interface SupabaseAnalytics {
  id: string;
  event: SupabaseEvent;
  metadata: Record<string, unknown>;
  timestamp: string;
  userId: string;
}
