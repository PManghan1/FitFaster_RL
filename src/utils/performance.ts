import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing store updates
 * @param callback Function to be debounced
 * @param delay Delay in milliseconds
 */
export const useDebounceCallback = (callback: (...args: unknown[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
};

/**
 * Memoization cache for expensive computations
 */
export class ComputeCache {
  private static cache = new Map<string, { value: unknown; timestamp: number }>();
  private static MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.MAX_CACHE_AGE) {
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  static set<T>(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Request cache implementation
 */
export class RequestCache {
  private static cache = new Map<string, { data: unknown; timestamp: number }>();
  private static MAX_AGE = 2 * 60 * 1000; // 2 minutes

  static async get<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.MAX_AGE) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  static start(label: string): void {
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number {
    const start = this.measurements.get(label);
    if (!start) return 0;

    const duration = performance.now() - start;
    this.measurements.delete(label);
    return duration;
  }
}
