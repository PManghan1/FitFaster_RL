import { TestAnalyticsService } from '../utils/TestAnalyticsService';
import {
  createTestAnalyticsService,
  createMockPerformanceMetrics,
  mockErrorEvent,
  mockEngagementMetrics,
  verifyEventTiming,
} from '../utils/analyticsTestUtils';

describe('AnalyticsService', () => {
  let analyticsService: TestAnalyticsService;

  beforeEach(() => {
    analyticsService = createTestAnalyticsService();
  });

  afterEach(() => {
    analyticsService.reset();
  });

  describe('Workout Tracking', () => {
    it('should track workout start correctly', () => {
      analyticsService.trackWorkout('start', { workoutId: '123' });
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('workout');
      expect(event?.event).toBe('start');
      expect(event?.data.workoutId).toBe('123');
    });

    it('should track workout completion with duration', () => {
      analyticsService.trackWorkout('complete', { workoutId: '123' });
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('workout');
      expect(event?.event).toBe('complete');
      expect(event?.data.duration).toBeDefined();
    });
  });

  describe('Nutrition Tracking', () => {
    it('should track meal logging correctly', () => {
      analyticsService.trackNutrition('meal', { mealId: '456' });
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('nutrition');
      expect(event?.event).toBe('meal');
      expect(event?.data.mealId).toBe('456');
    });

    it('should track meal plan completion with duration', () => {
      analyticsService.trackNutrition('meal_plan_complete', { mealId: '456' });
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('nutrition');
      expect(event?.event).toBe('meal_plan_complete');
      expect(event?.data.duration).toBeDefined();
    });
  });

  describe('Error Tracking', () => {
    it('should track errors with context', () => {
      const error = mockErrorEvent('Test error');
      const context = { operation: 'test' };

      analyticsService.trackError(error, context);
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('error');
      expect(event?.data.message).toBe('Test error');
      expect(event?.data.context).toEqual(context);
    });
  });

  describe('Screen View Tracking', () => {
    it('should track screen views with performance metrics', () => {
      const metrics = createMockPerformanceMetrics();
      analyticsService.trackScreenView('Home', metrics);
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('navigation');
      expect(event?.event).toBe('View Home');
      expect(event?.data.performanceMetrics).toBeDefined();
    });
  });

  describe('Engagement Tracking', () => {
    it('should track user engagement metrics', () => {
      const metrics = mockEngagementMetrics(5, 10);
      analyticsService.trackEngagement(metrics);
      const event = analyticsService.getLastTrackedEvent();

      expect(event?.category).toBe('engagement');
      expect(event?.data.screenViews).toBe(5);
      expect(event?.data.interactions).toBe(10);
    });
  });

  describe('Event Sequence Verification', () => {
    it('should verify correct event sequences', () => {
      analyticsService.trackWorkout('start', { workoutId: '123' });
      analyticsService.trackWorkout('complete', { workoutId: '123' });

      const sequence = [
        { category: 'workout', event: 'start' },
        { category: 'workout', event: 'complete' },
      ];

      expect(analyticsService.verifyEventSequence(sequence)).toBe(true);
    });

    it('should verify event timing constraints', () => {
      analyticsService.trackWorkout('start', { workoutId: '123' });
      analyticsService.trackWorkout('complete', { workoutId: '123' });

      const sequence = [
        { category: 'workout', event: 'start' },
        { category: 'workout', event: 'complete' },
      ];

      expect(verifyEventTiming(analyticsService, sequence, 1000)).toBe(true);
    });
  });
});
