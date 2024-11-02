declare interface PerformanceEntry {
  readonly duration: number;
  readonly entryType: string;
  readonly name: string;
  readonly startTime: number;
}

declare interface Performance {
  now(): number;
  mark(name: string): void;
  measure(name: string, startMark?: string, endMark?: string): void;
  clearMarks(name?: string): void;
  clearMeasures(name?: string): void;
  getEntriesByName(name: string, type?: string): PerformanceEntry[];
  getEntriesByType(type: string): PerformanceEntry[];
  getEntries(): PerformanceEntry[];
}

declare global {
  const performance: Performance;
}
