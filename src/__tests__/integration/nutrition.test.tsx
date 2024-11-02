import { act, renderHook } from '@testing-library/react-native';

import { nutritionService } from '../../services/nutrition';
import { performanceMonitoring } from '../../services/performance';
import { useNutritionStore } from '../../store/nutrition.store';

jest.mock('../../services/supabase');
jest.mock('../../services/performance');

describe('Nutrition Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { result } = renderHook(() => useNutritionStore());
    act(() => {
      result.current.setError(null);
      result.current.setLoading(false);
    });
  });

  it('should log meal and update store', async () => {
    const { result } = renderHook(() => useNutritionStore());

    const mealData = {
      name: 'Test Meal',
      calories: 500,
      protein: 30,
      carbs: 50,
      fat: 20,
    };

    await act(async () => {
      await nutritionService.logMeal(mealData);
    });

    expect(result.current.meals[0]).toMatchObject(mealData);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      expect.any(Promise),
      'log_meal',
      expect.any(Object),
    );
  });

  it('should handle meal logging errors', async () => {
    const mockError = new Error('API Error');
    jest.spyOn(nutritionService, 'logMeal').mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useNutritionStore());
    let caughtError;

    await act(async () => {
      try {
        await nutritionService.logMeal({
          name: 'Test Meal',
          calories: 500,
        });
      } catch (error) {
        caughtError = error;
      }
    });

    expect(caughtError).toBe(mockError);
    expect(result.current.error).toBeDefined();
  });

  it('should track performance metrics for API calls', async () => {
    await act(async () => {
      await nutritionService.logMeal({
        name: 'Test Meal',
        calories: 500,
      });
    });

    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      expect.any(Promise),
      'log_meal',
      expect.any(Object),
    );
  });

  it('should batch multiple nutrition logs', async () => {
    const { result } = renderHook(() => useNutritionStore());

    const meals = [
      { name: 'Breakfast', calories: 400 },
      { name: 'Lunch', calories: 600 },
      { name: 'Dinner', calories: 500 },
    ];

    await act(async () => {
      await Promise.all(meals.map(meal => nutritionService.logMeal(meal)));
    });

    expect(result.current.meals).toHaveLength(3);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledTimes(3);
  });
});
