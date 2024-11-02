export type WorkoutEventType = 'start' | 'complete' | 'add_exercise' | 'add_set' | 'end';

export type NutritionEventType = 'meal' | 'supplement' | 'scan';

export interface AnalyticsMetadata {
  userId?: string;
  sessionId?: string;
  screenName?: string;
  value?: number;
  [key: string]: unknown;
}

export interface UserEngagementMetrics {
  activeTime: number;
  screenViews: number;
  interactions: number;
  features: Record<string, number>;
}

export interface AnalyticsService {
  trackWorkout: (event: WorkoutEventType, data: AnalyticsMetadata) => void;
  trackNutrition: (event: NutritionEventType, data: AnalyticsMetadata) => void;
  trackError: (error: Error) => void;
  trackScreenView: (screenName: string, data?: AnalyticsMetadata) => void;
  trackEngagement: (metrics: Partial<UserEngagementMetrics>) => void;
}
