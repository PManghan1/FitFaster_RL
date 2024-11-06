// Base metric types
export interface BaseMetric {
  timestamp: number;
}

export interface MetricPayload extends BaseMetric {
  name: string;
  type: string;
  startTime: number;
  duration: number;
}

// Analytics metadata
export interface PerformanceMetricsData {
  loadTime?: number;
  responseTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  apiLatency?: number;
  duration?: number;
}

export interface ContextData {
  route?: string;
  action?: string;
  result?: string;
  exerciseId?: string;
  mealType?: string;
  duration?: number;
  totalMeals?: number;
  screen?: string;
  operation?: string;
  performanceMetrics?: PerformanceMetricsData;
  sets?: number;
  completedSets?: number;
  totalExercises?: number;
  totalSets?: number;
  reps?: number;
  totalWeight?: number;
  calories?: number;
  totalCalories?: number;
  proteins?: number;
}

export interface AnalyticsMetadata {
  userId?: string;
  sessionId?: string;
  platform?: string;
  appVersion?: string;
  deviceInfo?: {
    os: string;
    version: string;
    model: string;
  };
  performanceMetrics?: PerformanceMetricsData;
  context?: ContextData;
  message?: string;
  workoutId?: string;
  mealId?: string;
}

// Critical operations interface
export interface CriticalOperation {
  name: string;
  attempts: number;
  successes: number;
  successCount: number;
  failureCount: number;
  averageTime: number;
  lastExecuted: number;
}

export interface CriticalOperations {
  workoutTracking: CriticalOperation;
  mealLogging: CriticalOperation;
}

// User engagement metrics
export interface UserEngagementMetrics extends BaseMetric {
  sessionDuration: number;
  screenViews: number;
  interactions: number;
  activeTime: number;
  features: {
    name: string;
    usageCount: number;
    averageDuration: number;
  }[];
  criticalOperations: CriticalOperations;
}

// App performance metrics
export interface AppMetrics extends BaseMetric {
  metrics: MetricPayload[];
}

// Network metrics
export interface NetworkMetric extends BaseMetric {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface ApiMetrics extends BaseMetric {
  metrics: NetworkMetric[];
}

// User interaction metrics
export interface InteractionMetric extends BaseMetric {
  id: string;
  name: string;
  duration: number;
  success: boolean;
  error?: string;
}

export interface UserMetrics extends BaseMetric {
  metrics: InteractionMetric[];
}

// Performance timing metrics
export interface TimingMetric extends BaseMetric {
  name: string;
  type: string;
  startTime: number;
  duration: number;
}

// Memory metrics
export interface MemoryMetric extends BaseMetric {
  usedMemory: number;
  totalMemory: number;
}

// Alert types
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'memory' | 'api' | 'frame' | 'interaction';

export interface PerformanceAlert extends BaseMetric {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metric?: Record<string, unknown>;
}

// Threshold configurations
export interface ThresholdConfig {
  warning: number;
  critical: number;
}

export interface MetricThresholds {
  memory: ThresholdConfig;
  api: ThresholdConfig;
  frame: ThresholdConfig;
  interaction: ThresholdConfig;
}

// Performance event types
export type PerformanceEventType =
  | 'app_launch'
  | 'screen_transition'
  | 'api_request'
  | 'interaction'
  | 'memory_usage'
  | 'frame_drop';

export interface PerformanceEvent extends BaseMetric {
  type: PerformanceEventType;
  data: Record<string, unknown>;
}

// Analytics event types
export type AnalyticsEventType =
  | 'session_start'
  | 'session_end'
  | 'screen_view'
  | 'feature_use'
  | 'error'
  | 'performance';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  metadata: AnalyticsMetadata;
  data: Record<string, unknown>;
}

// Analytics batch processing
export interface AnalyticsBatch {
  batchId: string;
  events: AnalyticsEvent[];
  metadata: AnalyticsMetadata;
  timestamp: number;
}
