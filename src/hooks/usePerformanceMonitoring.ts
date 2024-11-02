import { useCallback, useEffect, useRef } from 'react';

import { MetricType, performanceMonitoring } from '../services/performance';

interface PerformanceMonitoringOptions {
  screenName: string;
  componentName: string;
  enableRenderTracking?: boolean;
}

export const usePerformanceMonitoring = ({
  screenName,
  componentName,
  enableRenderTracking = false,
}: PerformanceMonitoringOptions) => {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    performanceMonitoring.measureScreenLoad(screenName);

    return () => {
      if (enableRenderTracking) {
        const duration = performance.now() - renderStartTime.current;
        performanceMonitoring.measureRender(componentName, duration);
      }
    };
  }, [screenName, componentName, enableRenderTracking]);

  const measureApiCall = useCallback(
    async <T>(
      promise: Promise<T>,
      name: string,
      metadata?: Record<string, unknown>,
    ): Promise<T> => {
      return performanceMonitoring.measureApiCall(promise, name, {
        screenName,
        componentName,
        ...metadata,
      });
    },
    [screenName, componentName],
  );

  const measureInteraction = useCallback(
    (name: string, callback: () => void, metadata?: Record<string, unknown>) => {
      performanceMonitoring.measureInteraction(name, callback, {
        screenName,
        componentName,
        ...metadata,
      });
    },
    [screenName, componentName],
  );

  const getMetrics = useCallback(() => {
    return performanceMonitoring.getMetrics();
  }, []);

  const getAverageMetric = useCallback((type: MetricType, name: string) => {
    return performanceMonitoring.getAverageMetric(type, name);
  }, []);

  return {
    measureApiCall,
    measureInteraction,
    getMetrics,
    getAverageMetric,
  };
};
