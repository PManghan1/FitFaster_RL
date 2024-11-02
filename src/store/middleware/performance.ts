import { StateCreator } from 'zustand';

import { PerformanceMonitor } from '../../utils/performance';

export const performanceMiddleware = <T extends object>(
  config: StateCreator<T>,
): StateCreator<T> => {
  return (set, get, api) => {
    return config(
      (...args) => {
        PerformanceMonitor.start('state-update');
        set(...args);
        const duration = PerformanceMonitor.end('state-update');

        if (duration > 16) {
          // 60fps threshold
          console.warn(`Slow state update detected: ${duration}ms`);
        }
      },
      get,
      api,
    );
  };
};

type StoreSelector<T> = {
  [K in keyof T]: () => T[K];
};

export const createSelectors = <T extends object>(
  store: (selector: (state: T) => unknown) => unknown,
): StoreSelector<T> => {
  const storeSelectors = {} as StoreSelector<T>;

  const createSelector = <K extends keyof T>(key: K): (() => T[K]) => {
    return () => store((state: T) => state[key]) as T[K];
  };

  // Type assertion is safe here because we're creating a selector for each key
  return new Proxy(storeSelectors, {
    get: (target, prop: string) => {
      if (!(prop in target)) {
        target[prop as keyof T] = createSelector(prop as keyof T);
      }
      return target[prop as keyof T];
    },
  }) as StoreSelector<T>;
};
