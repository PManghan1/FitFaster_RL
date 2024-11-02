import { act, renderHook } from '@testing-library/react-native';

import { performanceMonitoring } from '../../services/performance';
import { workoutService } from '../../services/workout';
import { useWorkoutStore } from '../../store/workout.store';
import { Exercise } from '../../types/workout';

jest.mock('../../services/supabase');
jest.mock('../../services/performance');
jest.mock('../../services/analytics');

describe('Workout Integration Tests', () => {
  const mockExercise: Exercise = {
    id: '1',
    name: 'Bench Press',
    type: 'STRENGTH',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    isCustom: false,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start workout and update store', async () => {
    const { result } = renderHook(() => useWorkoutStore());

    await act(async () => {
      await workoutService.startWorkout('user-123', 'Test Workout');
    });

    expect(result.current.currentWorkout).toBeDefined();
    expect(result.current.isActive).toBe(true);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      expect.any(Promise),
      'start_workout',
      expect.any(Object),
    );
  });

  it('should add exercise to workout', async () => {
    const { result } = renderHook(() => useWorkoutStore());

    await act(async () => {
      await workoutService.startWorkout('user-123', 'Test Workout');
      await workoutService.addExercise(result.current.currentWorkout!.id, mockExercise);
    });

    const exerciseData = result.current.currentWorkout?.exerciseData[0];
    expect(exerciseData?.exercise).toEqual(mockExercise);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      expect.any(Promise),
      'add_exercise',
      expect.any(Object),
    );
  });

  it('should add set to exercise', async () => {
    const { result } = renderHook(() => useWorkoutStore());
    const mockSet = {
      weight: 100,
      reps: 10,
      exerciseId: mockExercise.id,
      completed: false,
    };

    await act(async () => {
      await workoutService.startWorkout('user-123', 'Test Workout');
      await workoutService.addExercise(result.current.currentWorkout!.id, mockExercise);
      await workoutService.addSet(result.current.currentWorkout!.id, mockExercise.id, mockSet);
    });

    const exerciseData = result.current.currentWorkout?.exerciseData[0];
    expect(exerciseData?.sets[0]).toMatchObject(mockSet);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      expect.any(Promise),
      'add_set',
      expect.any(Object),
    );
  });

  it('should end workout and update store', async () => {
    const { result } = renderHook(() => useWorkoutStore());

    await act(async () => {
      await workoutService.startWorkout('user-123', 'Test Workout');
      await workoutService.endWorkout(result.current.currentWorkout!.id);
    });

    expect(result.current.currentWorkout).toBeNull();
    expect(result.current.isActive).toBe(false);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      expect.any(Promise),
      'end_workout',
      expect.any(Object),
    );
  });

  it('should handle concurrent operations correctly', async () => {
    const { result } = renderHook(() => useWorkoutStore());

    await act(async () => {
      await workoutService.startWorkout('user-123', 'Test Workout');

      // Simulate concurrent operations
      await Promise.all([
        workoutService.addExercise(result.current.currentWorkout!.id, mockExercise),
        workoutService.addExercise(result.current.currentWorkout!.id, {
          ...mockExercise,
          id: '2',
          name: 'Squats',
        }),
      ]);
    });

    expect(result.current.currentWorkout?.exerciseData).toHaveLength(2);
    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledTimes(3); // start + 2 adds
  });
});
