export enum MetricType {
  API_CALL = 'api_call',
  SCREEN_LOAD = 'screen_load',
  INTERACTION = 'interaction',
  OPERATION_DURATION = 'operation_duration',
}

interface MetricEntry {
  value: number;
  timestamp: number;
}

class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private metrics: Map<string, MetricEntry[]>;
  private readonly maxEntries: number = 100;

  private constructor() {
    this.metrics = new Map();
  }

  static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  trackMetric(type: MetricType, name: string, value: number): void {
    const key = `${type}:${name}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const entries = this.metrics.get(key)!;
    entries.push({
      value,
      timestamp: Date.now(),
    });

    // Keep only the last maxEntries
    if (entries.length > this.maxEntries) {
      entries.shift();
    }
  }

  getAverageMetric(type: MetricType, name: string): number {
    const key = `${type}:${name}`;
    const entries = this.metrics.get(key);

    if (!entries || entries.length === 0) {
      return 0;
    }

    const sum = entries.reduce((acc, entry) => acc + entry.value, 0);
    return sum / entries.length;
  }

  getMetricTrend(type: MetricType, name: string): number[] {
    const key = `${type}:${name}`;
    const entries = this.metrics.get(key);

    if (!entries || entries.length === 0) {
      return [];
    }

    return entries.map(entry => entry.value);
  }

  getLatestMetric(type: MetricType, name: string): number {
    const key = `${type}:${name}`;
    const entries = this.metrics.get(key);

    if (!entries || entries.length === 0) {
      return 0;
    }

    return entries[entries.length - 1].value;
  }

  reset(): void {
    this.metrics.clear();
  }

  detectPerformanceDegradation(type: MetricType, name: string, threshold: number = 1.5): boolean {
    const trend = this.getMetricTrend(type, name);
    if (trend.length < 2) return false;

    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return secondAvg / firstAvg >= threshold;
  }
}

export const performanceMonitoring = PerformanceMonitoring.getInstance();
