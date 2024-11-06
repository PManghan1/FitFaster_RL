import { TestAnalyticsService } from '../utils/TestAnalyticsService';
import type { AnalyticsMetadata, UserEngagementMetrics } from '../../types/analytics';

// Mock performance.now() for consistent timing in tests
const mockNow = jest.fn(() => 1000);
const originalPerformanceNow = global.performance.now;
global.performance.now = mockNow;

// Restore original after tests
afterAll(() => {
  global.performance.now = originalPerformanceNow;
});

describe('Analytics & Performance Integration', () => {
  let analyticsService: TestAnalyticsService;

  beforeEach(() => {
    analyticsService = new TestAnalyticsService();
    jest.useFakeTimers();
    mockNow.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should track a complete user journey with performance metrics', () => {
    // Simulate app launch and initial navigation
    analyticsService.trackScreenView('Home', {
      performanceMetrics: {
        loadTime: 250,
        apiLatency: 100,
      },
    });

    // Start workout session
    analyticsService.trackWorkout('start', {
      performanceMetrics: {
        apiLatency: 150,
      },
    });

    // Add exercises to workout
    analyticsService.trackWorkout('add_exercise', {
      performanceMetrics: {
        apiLatency: 120,
      },
      context: {
        exerciseId: 'bench-press',
        sets: 3,
        reps: 10,
      },
    });

    // Complete exercises
    analyticsService.trackWorkout('exercise_complete', {
      performanceMetrics: {
        apiLatency: 130,
      },
      context: {
        exerciseId: 'bench-press',
        completedSets: 3,
        totalWeight: 225,
      },
    });

    // Complete workout
    analyticsService.trackWorkout('complete', {
      performanceMetrics: {
        apiLatency: 140,
      },
      context: {
        duration: 3600,
        totalExercises: 3,
        totalSets: 9,
      },
    });

    // Navigate to nutrition tracking
    analyticsService.trackScreenView('NutritionTracking', {
      performanceMetrics: {
        loadTime: 200,
        apiLatency: 110,
      },
    });

    // Log meals
    analyticsService.trackNutrition('meal', {
      performanceMetrics: {
        apiLatency: 160,
      },
      context: {
        mealType: 'lunch',
        calories: 650,
        proteins: 45,
      },
    });

    // Simulate error scenario
    const error = new Error('Network timeout while syncing meal data');
    analyticsService.trackError(error, {
      operation: 'meal_sync',
      screen: 'NutritionTracking',
      performanceMetrics: {
        apiLatency: 5000, // High latency indicating issue
      },
    });

    // Complete meal plan
    analyticsService.trackNutrition('meal_plan_complete', {
      performanceMetrics: {
        apiLatency: 130,
      },
      context: {
        totalMeals: 3,
        totalCalories: 2200,
      },
    });

    // Track final engagement metrics
    analyticsService.trackEngagement();

    // Verify event sequence
    expect(
      analyticsService.verifyEventSequence([
        { category: 'navigation', event: 'View Home' },
        { category: 'workout', event: 'start' },
        { category: 'workout', event: 'add_exercise' },
        { category: 'workout', event: 'exercise_complete' },
        { category: 'workout', event: 'complete' },
        { category: 'navigation', event: 'View NutritionTracking' },
        { category: 'nutrition', event: 'meal' },
        { category: 'error', event: 'Error' },
        { category: 'nutrition', event: 'meal_plan_complete' },
        { category: 'engagement', event: 'Session metrics' },
      ])
    ).toBe(true);

    // Verify performance metrics were tracked
    const workoutEvents = analyticsService.getEventsByCategory('workout');
    workoutEvents.forEach(event => {
      expect(event.data.performanceMetrics?.apiLatency).toBeDefined();
      expect(typeof event.data.performanceMetrics?.apiLatency).toBe('number');
    });

    // Verify error handling
    const errorEvents = analyticsService.getEventsByCategory('error');
    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].data.message).toBe('Network timeout while syncing meal data');
    expect(errorEvents[0].data.context?.operation).toBe('meal_sync');
    expect(errorEvents[0].data.performanceMetrics?.apiLatency).toBe(5000);

    // Verify engagement metrics
    const engagementEvent = analyticsService.getLastTrackedEvent();
    expect(engagementEvent?.category).toBe('engagement');

    // Get the engagement metrics data
    const metricsData = engagementEvent?.data as unknown;

    // Type guard to ensure engagement metrics structure
    function isUserEngagementMetrics(data: unknown): data is UserEngagementMetrics {
      const metrics = data as UserEngagementMetrics;
      return (
        metrics !== null &&
        typeof metrics === 'object' &&
        typeof metrics.activeTime === 'number' &&
        typeof metrics.screenViews === 'number' &&
        typeof metrics.interactions === 'number' &&
        metrics.features !== undefined &&
        metrics.criticalOperations !== undefined &&
        typeof metrics.criticalOperations === 'object' &&
        'workoutTracking' in metrics.criticalOperations &&
        'mealLogging' in metrics.criticalOperations
      );
    }

    expect(engagementEvent).toBeDefined();
    expect(isUserEngagementMetrics(metricsData)).toBe(true);

    if (isUserEngagementMetrics(metricsData)) {
      expect(metricsData.screenViews).toBeGreaterThan(0);
      expect(metricsData.interactions).toBeGreaterThan(0);
      expect(metricsData.features).toHaveProperty('workout');
      expect(metricsData.features).toHaveProperty('nutrition');

      // Verify critical operations tracking
      expect(metricsData.criticalOperations.workoutTracking.attempts).toBe(2); // start and add_exercise
      expect(metricsData.criticalOperations.workoutTracking.successes).toBe(2); // exercise_complete and complete
      expect(metricsData.criticalOperations.mealLogging.attempts).toBe(1); // meal
      expect(metricsData.criticalOperations.mealLogging.successes).toBe(1); // meal_plan_complete
    }
  });

  it('should track performance metrics within acceptable ranges', () => {
    const performanceData: AnalyticsMetadata = {
      performanceMetrics: {
        loadTime: 300,
        apiLatency: 200,
      },
    };

    analyticsService.trackScreenView('Home', performanceData);

    const navigationEvent = analyticsService.getEventsByCategory('navigation')[0];
    expect(navigationEvent.data.performanceMetrics?.loadTime).toBeLessThanOrEqual(500); // 500ms threshold
    expect(navigationEvent.data.performanceMetrics?.apiLatency).toBeLessThanOrEqual(300); // 300ms threshold
  });

  it('should maintain correct timing between related events', () => {
    // Start workout
    analyticsService.trackWorkout('start', {});

    // Advance timer by 5 seconds
    jest.advanceTimersByTime(5000);

    // Complete workout
    analyticsService.trackWorkout('complete', {});

    // Verify timing between start and complete
    expect(
      analyticsService.verifyTimingBetweenEvents(0, 1, 10000) // 10 second threshold
    ).toBe(true);
  });

  it('should properly track and categorize errors with context', () => {
    // Track screen view before error
    analyticsService.trackScreenView('WorkoutScreen', {
      performanceMetrics: { loadTime: 200 },
    });

    // Simulate API error
    const apiError = new Error('Failed to fetch workout data');
    analyticsService.trackError(apiError, {
      operation: 'fetch_workout',
      screen: 'WorkoutScreen',
      performanceMetrics: { apiLatency: 3000 },
    });

    // Verify error tracking
    const errorEvents = analyticsService.getEventsByCategory('error');
    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].data.context?.screen).toBe('WorkoutScreen');
    expect(errorEvents[0].data.context?.operation).toBe('fetch_workout');
    expect(errorEvents[0].data.performanceMetrics?.apiLatency).toBe(3000);
  });
});
