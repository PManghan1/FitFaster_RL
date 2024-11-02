import { PerformanceMonitor, RequestCache } from '../utils/performance';

export class BaseService {
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = `${options.method || 'GET'}-${endpoint}`;

    try {
      PerformanceMonitor.start(cacheKey);

      const response = await RequestCache.get(cacheKey, async () => {
        const res = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return await res.json();
      });

      const duration = PerformanceMonitor.end(cacheKey);
      if (duration > 1000) {
        console.warn(`Slow request detected: ${cacheKey} took ${duration}ms`);
      }

      return response;
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected invalidateCache(endpoint: string, method = 'GET'): void {
    RequestCache.invalidate(`${method}-${endpoint}`);
  }
}
