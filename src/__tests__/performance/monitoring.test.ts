import { TestAnalyticsService } from '../utils/TestAnalyticsService';
import { MetricType, performanceMonitoring } from '../../services/performance';
import { createTestAnalyticsService } from '../utils/analyticsTestUtils';

describe('Performance Monitoring', () => {
  let analyticsService: TestAnalyticsService;

  beforeEach(() => {
    analyticsService = createTestAnalyticsService();
    performanceMonitoring.reset();
  });

  describe('Screen Performance', () => {
    it('should track screen load times correctly', () => {
      performanceMonitoring.trackMetric(MetricType.SCREEN_LOAD, 'HomeScreen', 250);

      analyticsService.trackScreenView('HomeScreen', {
        performanceMetrics: {
          loadTime: performanceMonitoring.getAverageMetric(MetricType.SCREEN_LOAD, 'HomeScreen'),
        },
      });

      const event = analyticsService.getLastTrackedEvent();
      expect(event?.data.performanceMetrics?.loadTime).toBe(250);
    });

    it('should calculate average screen load times', () => {
      performanceMonitoring.trackMetric(MetricType.SCREEN_LOAD, 'HomeScreen', 200);
      performanceMonitoring.trackMetric(MetricType.SCREEN_LOAD, 'HomeScreen', 300);

      const avgLoadTime = performanceMonitoring.getAverageMetric(
        MetricType.SCREEN_LOAD,
        'HomeScreen'
      );
      expect(avgLoadTime).toBe(250);
    });
  });

  describe('Critical Operations', () => {
    it('should track workout performance metrics', async () => {
      const startTime = Date.now();

      analyticsService.trackWorkout('start', { workoutId: '123' });
      performanceMonitoring.trackMetric(MetricType.API_CALL, 'workout', 150);

      await new Promise(resolve => setTimeout(resolve, 100));

      const operationDuration = Date.now() - startTime;
      performanceMonitoring.trackMetric(
        MetricType.OPERATION_DURATION,
        'workout',
        operationDuration
      );

      analyticsService.trackWorkout('complete', {
        workoutId: '123',
        performanceMetrics: {
          apiLatency: performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'workout'),
          duration: performanceMonitoring.getAverageMetric(
            MetricType.OPERATION_DURATION,
            'workout'
          ),
        },
      });

      const events = analyticsService.getEventsByCategory('workout');
      expect(events).toHaveLength(2);
      expect(events[1].data.performanceMetrics?.apiLatency).toBe(150);
      expect(events[1].data.performanceMetrics?.duration).toBeGreaterThanOrEqual(100);
    });

    it('should track nutrition logging performance', async () => {
      const startTime = Date.now();

      analyticsService.trackNutrition('meal', { mealId: '456' });
      performanceMonitoring.trackMetric(MetricType.API_CALL, 'nutrition', 100);

      await new Promise(resolve => setTimeout(resolve, 100));

      const operationDuration = Date.now() - startTime;
      performanceMonitoring.trackMetric(
        MetricType.OPERATION_DURATION,
        'nutrition',
        operationDuration
      );

      analyticsService.trackNutrition('meal_plan_complete', {
        mealId: '456',
        performanceMetrics: {
          apiLatency: performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'nutrition'),
          duration: performanceMonitoring.getAverageMetric(
            MetricType.OPERATION_DURATION,
            'nutrition'
          ),
        },
      });

      const events = analyticsService.getEventsByCategory('nutrition');
      expect(events).toHaveLength(2);
      expect(events[1].data.performanceMetrics?.apiLatency).toBe(100);
      expect(events[1].data.performanceMetrics?.duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Error Context', () => {
    it('should include performance context in error tracking', () => {
      performanceMonitoring.trackMetric(MetricType.API_CALL, 'workout', 300);
      performanceMonitoring.trackMetric(MetricType.SCREEN_LOAD, 'WorkoutScreen', 500);

      const error = new Error('API Error');
      analyticsService.trackError(error, {
        operation: 'workout',
        screen: 'WorkoutScreen',
        performanceMetrics: {
          apiLatency: performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'workout'),
          loadTime: performanceMonitoring.getAverageMetric(MetricType.SCREEN_LOAD, 'WorkoutScreen'),
        },
      });

      const event = analyticsService.getLastTrackedEvent();
      expect(event?.category).toBe('error');
      expect(event?.data.context?.performanceMetrics?.apiLatency).toBe(300);
      expect(event?.data.context?.performanceMetrics?.loadTime).toBe(500);
    });
  });

  describe('Performance Patterns', () => {
    it('should detect performance degradation patterns', () => {
      for (let i = 0; i < 5; i++) {
        performanceMonitoring.trackMetric(MetricType.API_CALL, 'workout', 100 + i * 50);
      }

      const avgLatency = performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'workout');
      expect(avgLatency).toBeGreaterThan(200);
    });

    it('should track concurrent operation impact', async () => {
      const operations = ['workout', 'nutrition', 'profile'];
      await Promise.all(
        operations.map(async op => {
          performanceMonitoring.trackMetric(MetricType.API_CALL, op, 150);
          await new Promise(resolve => setTimeout(resolve, 50));
        })
      );

      operations.forEach(op => {
        const latency = performanceMonitoring.getAverageMetric(MetricType.API_CALL, op);
        expect(latency).toBe(150);
      });
    });
  });
});
