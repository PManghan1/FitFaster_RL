export interface PerformanceMetrics {
  loadTime?: number;
  apiLatency?: number;
  duration?: number;
}

export interface ErrorContext {
  operation?: string;
  screen?: string;
  performanceMetrics?: PerformanceMetrics;
  [key: string]: unknown;
}

export interface AnalyticsMetadata {
  performanceMetrics?: PerformanceMetrics;
  context?: ErrorContext;
  [key: string]: unknown;
}

export type WorkoutEventType =
  | 'start'
  | 'complete'
  | 'add_exercise'
  | 'add_set'
  | 'exercise_complete';
export type NutritionEventType = 'meal' | 'scan' | 'meal_plan_complete';

export interface UserEngagementMetrics {
  activeTime: number;
  screenViews: number;
  interactions: number;
  features: Record<string, number>;
  criticalOperations: {
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
