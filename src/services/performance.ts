import * as Sentry from '@sentry/react-native';

export enum MetricType {
  SCREEN_LOAD = 'screen_load',
  API_CALL = 'api_call',
  RENDER = 'render',
  INTERACTION = 'interaction',
  RESOURCE = 'resource',
}

export interface PerformanceMetric {
  type: MetricType;
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

type MetricCallback = (metric: PerformanceMetric) => void;

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metricCallbacks: Set<MetricCallback> = new Set();
  private metrics: PerformanceMetric[] = [];

  private constructor() {}

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  onMetric(callback: MetricCallback): () => void {
    this.metricCallbacks.add(callback);
    return () => {
      this.metricCallbacks.delete(callback);
    };
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.metricCallbacks.forEach(callback => callback(metric));

    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.type}: ${metric.name}`,
      data: {
        duration: metric.duration,
        ...metric.metadata,
      },
    });
  }

  async measureApiCall<T>(
    promise: Promise<T>,
    name: string,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await promise;
      const duration = performance.now() - startTime;

      this.recordMetric({
        type: MetricType.API_CALL,
        name,
        startTime,
        duration,
        metadata: {
          ...metadata,
          success: true,
        },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        type: MetricType.API_CALL,
        name,
        startTime,
        duration,
        metadata: {
          ...metadata,
          success: false,
          error,
        },
      });

      throw error;
    }
  }

  measureScreenLoad(name: string, metadata?: Record<string, unknown>): void {
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        type: MetricType.SCREEN_LOAD,
        name,
        startTime,
        duration,
        metadata,
      });
    });
  }

  measureRender(name: string, duration: number, metadata?: Record<string, unknown>): void {
    this.recordMetric({
      type: MetricType.RENDER,
      name,
      startTime: performance.now() - duration,
      duration,
      metadata,
    });
  }

  measureInteraction(name: string, callback: () => void, metadata?: Record<string, unknown>): void {
    const startTime = performance.now();
    callback();
    const duration = performance.now() - startTime;
    this.recordMetric({
      type: MetricType.INTERACTION,
      name,
      startTime,
      duration,
      metadata,
    });
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  getAverageMetric(type: MetricType, name: string): number {
    const relevantMetrics = this.metrics.filter(
      metric => metric.type === type && metric.name === name,
    );

    if (relevantMetrics.length === 0) return 0;

    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / relevantMetrics.length;
  }
}

export const performanceMonitoring = PerformanceMonitoringService.getInstance();
