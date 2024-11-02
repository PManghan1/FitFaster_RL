import { nutritionService } from '../../services/nutrition';
import { performanceMonitoring } from '../../services/performance';
import { workoutService } from '../../services/workout';

describe('API Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log meal within performance threshold', async () => {
    const startTime = performance.now();

    await nutritionService.logMeal({
      name: 'Test Meal',
      calories: 500,
    });

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000); // 1 second threshold
  });

  it('should start workout within performance threshold', async () => {
    const startTime = performance.now();

    await workoutService.startWorkout('user-id', 'Test Workout');

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(500); // 500ms threshold
  });

  it('should handle concurrent API calls efficiently', async () => {
    const startTime = performance.now();

    await Promise.all([
      nutritionService.logMeal({ name: 'Meal 1', calories: 500 }),
      nutritionService.logMeal({ name: 'Meal 2', calories: 600 }),
      nutritionService.logMeal({ name: 'Meal 3', calories: 700 }),
    ]);

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(2000); // 2 second threshold for 3 concurrent calls
  });

  it('should track API call metrics', async () => {
    const metricsCallback = jest.fn();
    const unsubscribe = performanceMonitoring.onMetric(metricsCallback);

    await nutritionService.logMeal({
      name: 'Test Meal',
      calories: 500,
    });

    expect(metricsCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'API_CALL',
        name: 'log_meal',
        duration: expect.any(Number),
      }),
    );

    unsubscribe();
  });
});
