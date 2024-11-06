import { InteractionManager } from 'react-native';
import type { AppMetrics, MetricPayload } from '../../types/analytics';

/**
 * App performance metrics tracking
 */
export class AppPerformanceMetrics {
  private metrics: Map<string, MetricPayload> = new Map();
  private isTracking = false;

  /**
   * Initialize performance tracking
   */
  initialize(): void {
    if (this.isTracking) return;
    this.isTracking = true;
    this.trackAppLaunch();
  }

  /**
   * Track app launch time
   */
  private trackAppLaunch(): void {
    const startTime = Date.now();

    InteractionManager.runAfterInteractions(() => {
      const endTime = Date.now();
      this.recordMetric('app_launch', startTime, endTime);
    });
  }

  /**
   * Track screen transition time
   * @param screenName - Name of the screen being transitioned to
   */
  trackScreenTransition(screenName: string): void {
    const startTime = Date.now();

    InteractionManager.runAfterInteractions(() => {
      const endTime = Date.now();
      this.recordMetric(`${screenName}_transition`, startTime, endTime);
    });
  }

  /**
   * Track long-running operations
   * @param operationName - Name of the operation
   * @param operation - The operation to track
   */
  async trackOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operation();
      const endTime = Date.now();
      this.recordMetric(operationName, startTime, endTime);
      return result;
    } catch (error) {
      const endTime = Date.now();
      this.recordMetric(`${operationName}_error`, startTime, endTime);
      throw error;
    }
  }

  /**
   * Track interaction completion time
   * @param interactionName - Name of the interaction
   * @param interaction - The interaction function to track
   */
  async trackInteraction<T>(interactionName: string, interaction: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    return new Promise<T>((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          const result = await interaction();
          const endTime = Date.now();
          this.recordMetric(`${interactionName}_interaction`, startTime, endTime);
          resolve(result);
        } catch (error) {
          const endTime = Date.now();
          this.recordMetric(`${interactionName}_interaction_error`, startTime, endTime);
          reject(error);
        }
      });
    });
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, startTime: number, endTime: number): void {
    const metric: MetricPayload = {
      name,
      type: 'performance',
      startTime,
      duration: endTime - startTime,
      timestamp: Date.now(),
    };

    this.metrics.set(name, metric);
    this.evaluateMetric(metric);
  }

  /**
   * Evaluate performance metric
   */
  private evaluateMetric(metric: MetricPayload): void {
    // Define thresholds for different types of operations
    const thresholds = {
      app_launch: 2000, // 2 seconds
      screen_transition: 500, // 500ms
      operation: 1000, // 1 second
      interaction: 100, // 100ms
    };

    // Get the appropriate threshold based on the metric name
    let threshold = thresholds.operation;
    if (metric.name === 'app_launch') {
      threshold = thresholds.app_launch;
    } else if (metric.name.includes('transition')) {
      threshold = thresholds.screen_transition;
    } else if (metric.name.includes('interaction')) {
      threshold = thresholds.interaction;
    }

    if (metric.duration > threshold) {
      console.warn(
        `Performance warning: ${metric.name} took ${metric.duration}ms ` +
          `(threshold: ${threshold}ms)`
      );
    }

    void this.emitMetric(metric);
  }

  /**
   * Emit metric to analytics service
   * @param metric - The metric to emit
   */
  private async emitMetric(metric: MetricPayload): Promise<void> {
    try {
      // Example analytics service integration
      console.info('Emitting performance metric:', {
        name: metric.name,
        type: metric.type,
        duration: metric.duration,
        timestamp: metric.timestamp,
      });

      // Here you would integrate with your actual analytics service
      // await analyticsService.trackMetric(metric);
    } catch (error) {
      console.error('Failed to emit performance metric:', error);
    }
  }

  /**
   * Get collected metrics
   */
  getMetrics(): AppMetrics {
    return {
      metrics: Array.from(this.metrics.values()),
      timestamp: Date.now(),
    };
  }

  /**
   * Clear collected metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Stop tracking and cleanup
   */
  cleanup(): void {
    this.isTracking = false;
    this.clearMetrics();
  }
}

export const appMetrics = new AppPerformanceMetrics();
