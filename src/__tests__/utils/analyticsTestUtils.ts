import { AnalyticsMetadata } from '../../types/analytics';
import { TestAnalyticsService } from './TestAnalyticsService';

export const createTestEvent = (category: string, event: string, data: AnalyticsMetadata = {}) => ({
  category,
  event,
  timestamp: Date.now(),
  data,
});

export const createMockPerformanceMetrics = (apiLatency: number = 100, loadTime: number = 200) => ({
  performanceMetrics: {
    apiLatency,
    loadTime,
  },
});

export const verifyEventTiming = (
  service: TestAnalyticsService,
  eventSequence: Array<{ category: string; event: string }>,
  maxDuration: number
): boolean => {
  for (let i = 0; i < eventSequence.length - 1; i++) {
    if (!service.verifyTimingBetweenEvents(i, i + 1, maxDuration)) {
      return false;
    }
  }
  return true;
};

export const createTestAnalyticsService = (): TestAnalyticsService => {
  return new TestAnalyticsService();
};

export const mockErrorEvent = (message: string = 'Test error'): Error => {
  return new Error(message);
};

export const mockEngagementMetrics = (screenViews: number = 0, interactions: number = 0) => ({
  screenViews,
  interactions,
  features: {},
});
