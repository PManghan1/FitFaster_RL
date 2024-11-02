import * as Sentry from '@sentry/react-native';

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

  private constructor() {
    this.sessionStartTime = Date.now();
    this.screenViewCount = 0;
    this.interactionCount = 0;
    this.featureUsage = {};
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  trackWorkout(event: WorkoutEventType, data: AnalyticsMetadata): void {
    Sentry.addBreadcrumb({
      category: 'workout',
      message: event,
      data,
    });

    this.incrementFeatureUsage('workout');
  }

  trackNutrition(event: NutritionEventType, data: AnalyticsMetadata): void {
    Sentry.addBreadcrumb({
      category: 'nutrition',
      message: event,
      data,
    });

    this.incrementFeatureUsage('nutrition');
  }

  trackError(error: Error): void {
    Sentry.captureException(error);
  }

  trackScreenView(screenName: string, data: AnalyticsMetadata = {}): void {
    this.screenViewCount++;

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `View ${screenName}`,
      data,
    });
  }

  trackEngagement(metrics: Partial<UserEngagementMetrics>): void {
    const sessionMetrics: UserEngagementMetrics = {
      activeTime: Date.now() - this.sessionStartTime,
      screenViews: this.screenViewCount,
      interactions: this.interactionCount,
      features: this.featureUsage,
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
