import { MetricType } from '../../services/performance';
import {
  AnalyticsMetadata,
  NutritionEventType,
  UserEngagementMetrics,
  WorkoutEventType,
} from '../../types/analytics';

interface TrackedEvent {
  category: string;
  event: string;
  timestamp: number;
  data: AnalyticsMetadata;
}

export class TestAnalyticsService {
  private events: TrackedEvent[] = [];
  private sessionStartTime: number;
  private screenViewCount: number = 0;
  private interactionCount: number = 0;
  private featureUsage: Record<string, number> = {};
  private criticalOperations = {
    mealLogging: { attempts: 0, successes: 0, totalTime: 0 },
    workoutTracking: { attempts: 0, successes: 0, totalTime: 0 },
  };

  constructor() {
    this.sessionStartTime = Date.now();
    this.reset();
  }

  // Core tracking methods that mirror the main service
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

    this.trackEvent('workout', event, data);
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

    this.trackEvent('nutrition', event, data);
    this.incrementFeatureUsage('nutrition');
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    const errorData: AnalyticsMetadata = {
      message: error.message,
      stack: error.stack,
      context: context,
      performanceMetrics: context?.performanceMetrics as any,
    };
    this.trackEvent('error', error.name, errorData);
  }

  trackScreenView(screenName: string, data: AnalyticsMetadata = {}): void {
    this.screenViewCount++;
    this.trackEvent('navigation', `View ${screenName}`, data);
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

    this.trackEvent('engagement', 'Session metrics', { ...sessionMetrics, ...metrics });
  }

  // Test-specific methods
  getLastTrackedEvent(): TrackedEvent | undefined {
    return this.events[this.events.length - 1];
  }

  getEventsByCategory(category: string): TrackedEvent[] {
    return this.events.filter(event => event.category === category);
  }

  getEventsByType(eventType: string): TrackedEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  verifyEventSequence(sequence: Array<{ category: string; event: string }>): boolean {
    if (sequence.length > this.events.length) return false;

    return sequence.every((expected, index) => {
      const actual = this.events[index];
      return actual.category === expected.category && actual.event === expected.event;
    });
  }

  verifyTimingBetweenEvents(
    firstEventIndex: number,
    secondEventIndex: number,
    expectedMaxDuration: number
  ): boolean {
    const firstEvent = this.events[firstEventIndex];
    const secondEvent = this.events[secondEventIndex];

    if (!firstEvent || !secondEvent) return false;

    return secondEvent.timestamp - firstEvent.timestamp <= expectedMaxDuration;
  }

  getMetricCount(category: string): number {
    return this.getEventsByCategory(category).length;
  }

  reset(): void {
    this.events = [];
    this.screenViewCount = 0;
    this.interactionCount = 0;
    this.featureUsage = {};
    this.criticalOperations = {
      mealLogging: { attempts: 0, successes: 0, totalTime: 0 },
      workoutTracking: { attempts: 0, successes: 0, totalTime: 0 },
    };
    this.sessionStartTime = Date.now();
  }

  private trackEvent(category: string, event: string, data: AnalyticsMetadata): void {
    this.events.push({
      category,
      event,
      timestamp: Date.now(),
      data,
    });
  }

  private incrementFeatureUsage(feature: string): void {
    this.featureUsage[feature] = (this.featureUsage[feature] || 0) + 1;
    this.interactionCount++;
  }
}
