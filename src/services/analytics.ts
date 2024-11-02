import * as Sentry from '@sentry/react-native';

import { MetricType, performanceMonitoring } from './performance';
import {
  AnalyticsMetadata,
  NutritionEventType,
  UserEngagementMetrics,
  WorkoutEventType,
} from '../types/analytics';

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionStartTime: number;
  private screenViewCount: number;
  private interactionCount: number;
  private featureUsage: Record<string, number>;
  private criticalOperations: {
    mealLogging: { attempts: number; successes: number; totalTime: number };
    workoutTracking: { attempts: number; successes: number; totalTime: number };
  };

  private constructor() {
    this.sessionStartTime = Date.now();
    this.screenViewCount = 0;
    this.interactionCount = 0;
    this.featureUsage = {};
    this.criticalOperations = {
      mealLogging: { attempts: 0, successes: 0, totalTime: 0 },
      workoutTracking: { attempts: 0, successes: 0, totalTime: 0 },
    };
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  trackWorkout(event: WorkoutEventType, data: AnalyticsMetadata): void {
    const startTime = performance.now();

    if (event === 'start' || event === 'add_exercise' || event === 'add_set') {
      this.criticalOperations.workoutTracking.attempts++;
    }

    if (event === 'complete' || event === 'exercise_complete') {
      this.criticalOperations.workoutTracking.successes++;
      const duration = performance.now() - startTime;
      this.criticalOperations.workoutTracking.totalTime += duration;
      data.duration = duration;
    }

    Sentry.addBreadcrumb({
      category: 'workout',
      message: event,
      data: {
        ...data,
        performanceMetrics: {
          ...data.performanceMetrics,
          apiLatency: performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'workout'),
        },
      },
    });

    this.incrementFeatureUsage('workout');
  }

  trackNutrition(event: NutritionEventType, data: AnalyticsMetadata): void {
    const startTime = performance.now();

    if (event === 'meal' || event === 'scan') {
      this.criticalOperations.mealLogging.attempts++;
    }

    if (event === 'meal_plan_complete') {
      this.criticalOperations.mealLogging.successes++;
      const duration = performance.now() - startTime;
      this.criticalOperations.mealLogging.totalTime += duration;
      data.duration = duration;
    }

    Sentry.addBreadcrumb({
      category: 'nutrition',
      message: event,
      data: {
        ...data,
        performanceMetrics: {
          ...data.performanceMetrics,
          apiLatency: performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'nutrition'),
        },
      },
    });

    this.incrementFeatureUsage('nutrition');
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    Sentry.withScope(scope => {
      scope.setExtra('performanceMetrics', {
        apiLatency: performanceMonitoring.getAverageMetric(
          MetricType.API_CALL,
          context?.operation as string,
        ),
        screenLoadTime: performanceMonitoring.getAverageMetric(
          MetricType.SCREEN_LOAD,
          context?.screen as string,
        ),
      });

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureException(error);
    });
  }

  trackScreenView(screenName: string, data: AnalyticsMetadata = {}): void {
    this.screenViewCount++;

    const loadTime = performanceMonitoring.getAverageMetric(MetricType.SCREEN_LOAD, screenName);

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `View ${screenName}`,
      data: {
        ...data,
        performanceMetrics: {
          ...data.performanceMetrics,
          loadTime,
        },
      },
    });
  }

  trackEngagement(metrics: Partial<UserEngagementMetrics> = {}): void {
    const sessionMetrics: UserEngagementMetrics = {
      activeTime: Date.now() - this.sessionStartTime,
      screenViews: this.screenViewCount,
      interactions: this.interactionCount,
      features: this.featureUsage,
      criticalOperations: {
        mealLogging: {
          attempts: this.criticalOperations.mealLogging.attempts,
          successes: this.criticalOperations.mealLogging.successes,
          averageTime:
            this.criticalOperations.mealLogging.successes > 0
              ? this.criticalOperations.mealLogging.totalTime /
                this.criticalOperations.mealLogging.successes
              : 0,
        },
        workoutTracking: {
          attempts: this.criticalOperations.workoutTracking.attempts,
          successes: this.criticalOperations.workoutTracking.successes,
          averageTime:
            this.criticalOperations.workoutTracking.successes > 0
              ? this.criticalOperations.workoutTracking.totalTime /
                this.criticalOperations.workoutTracking.successes
              : 0,
        },
      },
    };

    Sentry.addBreadcrumb({
      category: 'engagement',
      message: 'Session metrics',
      data: { ...sessionMetrics, ...metrics },
    });
  }

  private incrementFeatureUsage(feature: string): void {
    this.featureUsage[feature] = (this.featureUsage[feature] || 0) + 1;
    this.interactionCount++;
  }
}

export const analyticsService = AnalyticsService.getInstance();
