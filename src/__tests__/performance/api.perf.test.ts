import { analyticsService } from '../../services/analytics';
import { performanceMonitoring, MetricType } from '../../services/performance';

jest.mock('@sentry/react-native');

describe('Performance Monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performance.now = jest.fn(() => Date.now());
  });

  it('should track API call performance', async () => {
    const mockPromise = Promise.resolve({ data: 'test' });
    const startTime = Date.now();

    await performanceMonitoring.measureApiCall(mockPromise, 'test_api');

    const metrics = performanceMonitoring.getMetrics();
    const apiMetrics = metrics.filter(m => m.type === MetricType.API_CALL);

    expect(apiMetrics[0].duration).toBeLessThan(1000);
    expect(apiMetrics[0].name).toBe('test_api');
    expect(apiMetrics[0].startTime).toBeGreaterThanOrEqual(startTime);
  });

  it('should track screen load performance', () => {
    const startTime = Date.now();
    performanceMonitoring.measureScreenLoad('TestScreen');

    const metrics = performanceMonitoring.getMetrics();
    const screenMetrics = metrics.filter(m => m.type === MetricType.SCREEN_LOAD);

    expect(screenMetrics[0].duration).toBeLessThan(1000);
    expect(screenMetrics[0].name).toBe('TestScreen');
    expect(screenMetrics[0].startTime).toBeGreaterThanOrEqual(startTime);
  });

  it('should track critical workout operations', async () => {
    const startTime = Date.now();

    analyticsService.trackWorkout('start', { userId: 'test-user' });
    analyticsService.trackWorkout('add_exercise', { exerciseId: 'test-exercise' });
    analyticsService.trackWorkout('complete', { duration: 300 });

    const metrics = performanceMonitoring.getMetrics();
    const workoutMetrics = metrics.filter(m => m.name.includes('workout'));

    expect(workoutMetrics.length).toBeGreaterThan(0);
    workoutMetrics.forEach(metric => {
      expect(metric.startTime).toBeGreaterThanOrEqual(startTime);
      expect(metric.duration).toBeLessThan(1000);
    });
  });

  it('should track critical nutrition operations', async () => {
    const startTime = Date.now();

    analyticsService.trackNutrition('meal', { mealId: 'test-meal' });
    analyticsService.trackNutrition('scan', { barcode: '123456' });
    analyticsService.trackNutrition('meal_plan_complete', { duration: 200 });

    const metrics = performanceMonitoring.getMetrics();
    const nutritionMetrics = metrics.filter(m => m.name.includes('nutrition'));

    expect(nutritionMetrics.length).toBeGreaterThan(0);
    nutritionMetrics.forEach(metric => {
      expect(metric.startTime).toBeGreaterThanOrEqual(startTime);
      expect(metric.duration).toBeLessThan(1000);
    });
  });

  it('should calculate average metrics correctly', async () => {
    // Simulate multiple API calls
    const promises = [
      performanceMonitoring.measureApiCall(Promise.resolve(1), 'test_api'),
      performanceMonitoring.measureApiCall(Promise.resolve(2), 'test_api'),
      performanceMonitoring.measureApiCall(Promise.resolve(3), 'test_api'),
    ];

    await Promise.all(promises);

    const average = performanceMonitoring.getAverageMetric(MetricType.API_CALL, 'test_api');
    expect(average).toBeGreaterThan(0);
    expect(average).toBeLessThan(1000);
  });

  it('should track error performance context', async () => {
    const error = new Error('Test error');
    const context = { operation: 'test_operation', screen: 'TestScreen' };

    analyticsService.trackError(error, context);

    const metrics = performanceMonitoring.getMetrics();
    const errorMetrics = metrics.filter(m => m.metadata?.error);

    expect(errorMetrics.length).toBeGreaterThan(0);
    errorMetrics.forEach(metric => {
      expect(metric.metadata?.error).toBeDefined();
      expect(metric.duration).toBeLessThan(1000);
    });
  });

  it('should track user engagement with performance context', () => {
    analyticsService.trackScreenView('TestScreen');
    analyticsService.trackWorkout('start', { userId: 'test-user' });
    analyticsService.trackWorkout('complete', { duration: 300 });

    analyticsService.trackEngagement();

    const metrics = performanceMonitoring.getMetrics();
    const engagementMetrics = metrics.filter(
      m => m.metadata?.screenViews || m.metadata?.interactions,
    );

    expect(engagementMetrics.length).toBeGreaterThan(0);
    engagementMetrics.forEach(metric => {
      expect(metric.duration).toBeDefined();
      expect(metric.startTime).toBeDefined();
    });
  });
});
