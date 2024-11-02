import { analyticsService } from '../../services/analytics';
import { MetricType, performanceMonitoring } from '../../services/performance';

jest.mock('@sentry/react-native');

describe('Performance Monitoring Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performance.now = jest.fn(() => Date.now());
  });

  describe('Critical Operations Tracking', () => {
    it('should track workout performance metrics', () => {
      const metricsCallback = jest.fn();
      const unsubscribe = performanceMonitoring.onMetric(metricsCallback);

      analyticsService.trackWorkout('start', { userId: 'test-user' });
      analyticsService.trackWorkout('add_exercise', { exerciseId: 'test-exercise' });
      analyticsService.trackWorkout('complete', { duration: 300 });

      expect(metricsCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MetricType.API_CALL,
          name: expect.stringContaining('workout'),
          duration: expect.any(Number),
        }),
      );

      unsubscribe();
    });

    it('should track nutrition performance metrics', () => {
      const metricsCallback = jest.fn();
      const unsubscribe = performanceMonitoring.onMetric(metricsCallback);

      analyticsService.trackNutrition('meal', { mealId: 'test-meal' });
      analyticsService.trackNutrition('scan', { barcode: '123456' });
      analyticsService.trackNutrition('meal_plan_complete', { duration: 200 });

      expect(metricsCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MetricType.API_CALL,
          name: expect.stringContaining('nutrition'),
          duration: expect.any(Number),
        }),
      );

      unsubscribe();
    });
  });

  describe('Screen Performance Tracking', () => {
    it('should track screen load times', () => {
      const metricsCallback = jest.fn();
      const unsubscribe = performanceMonitoring.onMetric(metricsCallback);

      analyticsService.trackScreenView('TestScreen');

      expect(metricsCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MetricType.SCREEN_LOAD,
          name: 'TestScreen',
          duration: expect.any(Number),
        }),
      );

      unsubscribe();
    });

    it('should calculate average screen load times', () => {
      analyticsService.trackScreenView('TestScreen');
      analyticsService.trackScreenView('TestScreen');
      analyticsService.trackScreenView('TestScreen');

      const average = performanceMonitoring.getAverageMetric(MetricType.SCREEN_LOAD, 'TestScreen');
      expect(average).toBeGreaterThan(0);
      expect(average).toBeLessThan(1000);
    });
  });

  describe('Error Tracking', () => {
    it('should include performance context in error tracking', () => {
      const error = new Error('Test error');
      const context = {
        operation: 'test_operation',
        screen: 'TestScreen',
      };

      analyticsService.trackError(error, context);

      const metrics = performanceMonitoring.getMetrics();
      const errorMetrics = metrics.filter(m => m.metadata?.error);

      expect(errorMetrics.length).toBeGreaterThan(0);
      expect(errorMetrics[0].metadata).toEqual(
        expect.objectContaining({
          error: expect.any(Error),
          operation: 'test_operation',
          screen: 'TestScreen',
        }),
      );
    });
  });

  describe('User Engagement', () => {
    it('should track engagement with performance metrics', () => {
      // Simulate user activity
      analyticsService.trackScreenView('Screen1');
      analyticsService.trackWorkout('start', { userId: 'test-user' });
      analyticsService.trackNutrition('meal', { mealId: 'test-meal' });
      analyticsService.trackWorkout('complete', { duration: 300 });

      analyticsService.trackEngagement();

      const metrics = performanceMonitoring.getMetrics();
      const engagementMetrics = metrics.filter(
        m => m.metadata?.screenViews || m.metadata?.interactions,
      );

      expect(engagementMetrics.length).toBeGreaterThan(0);
      expect(engagementMetrics[0].metadata).toEqual(
        expect.objectContaining({
          screenViews: expect.any(Number),
          interactions: expect.any(Number),
          features: expect.any(Object),
        }),
      );
    });

    it('should track critical operation success rates', () => {
      // Simulate workout tracking
      analyticsService.trackWorkout('start', { userId: 'test-user' });
      analyticsService.trackWorkout('add_exercise', { exerciseId: 'ex1' });
      analyticsService.trackWorkout('complete', { duration: 300 });

      // Simulate meal logging
      analyticsService.trackNutrition('meal', { mealId: 'meal1' });
      analyticsService.trackNutrition('meal_plan_complete', { duration: 200 });

      analyticsService.trackEngagement();

      const metrics = performanceMonitoring.getMetrics();
      const operationMetrics = metrics.filter(m => m.metadata?.criticalOperations);

      expect(operationMetrics.length).toBeGreaterThan(0);
      expect(operationMetrics[0].metadata?.criticalOperations).toEqual(
        expect.objectContaining({
          workoutTracking: expect.any(Object),
          mealLogging: expect.any(Object),
        }),
      );
    });
  });
});
