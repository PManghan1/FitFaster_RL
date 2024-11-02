export type WorkoutEventType =
  | 'start'
  | 'complete'
  | 'add_exercise'
  | 'add_set'
  | 'end'
  | 'rest_timer_start'
  | 'rest_timer_end'
  | 'exercise_complete'
  | 'weight_update'
  | 'personal_record';

export type NutritionEventType =
  | 'meal'
  | 'supplement'
  | 'scan'
  | 'meal_plan_create'
  | 'meal_plan_complete'
  | 'macro_target_set'
  | 'water_intake'
  | 'food_favorite';

export interface AnalyticsMetadata {
  userId?: string;
  sessionId?: string;
  screenName?: string;
  value?: number;
  duration?: number;
  success?: boolean;
  errorCode?: string;
  errorMessage?: string;
  performanceMetrics?: {
    loadTime?: number;
    renderTime?: number;
    apiLatency?: number;
  };
  [key: string]: unknown;
}

export interface UserEngagementMetrics {
  activeTime: number;
  screenViews: number;
  interactions: number;
  features: Record<string, number>;
  criticalOperations?: {
    mealLogging: {
      attempts: number;
      successes: number;
      averageTime: number;
    };
    workoutTracking: {
      attempts: number;
      successes: number;
      averageTime: number;
    };
  };
}

export interface AnalyticsService {
  trackWorkout: (event: WorkoutEventType, data: AnalyticsMetadata) => void;
  trackNutrition: (event: NutritionEventType, data: AnalyticsMetadata) => void;
  trackError: (error: Error) => void;
  trackScreenView: (screenName: string, data?: AnalyticsMetadata) => void;
  trackEngagement: (metrics: Partial<UserEngagementMetrics>) => void;
}
