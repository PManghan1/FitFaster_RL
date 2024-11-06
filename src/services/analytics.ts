import type { AnalyticsEvent, AnalyticsMetadata } from '../types/analytics';

class AnalyticsService {
  /**
   * Track an error event
   */
  async trackError(metadata: AnalyticsMetadata, data?: Record<string, unknown>): Promise<void> {
    const event: AnalyticsEvent = {
      type: 'error',
      timestamp: Date.now(),
      metadata,
      data: data || {},
    };

    await this.trackEvent(event);
  }

  /**
   * Track any analytics event
   */
  private async trackEvent(event: AnalyticsEvent): Promise<void> {
    // Implementation would depend on analytics provider
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }
  }
}

export const analyticsService = new AnalyticsService();
