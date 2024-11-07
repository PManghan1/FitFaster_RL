import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { AchievementEvent } from '../../gamification/achievements/types';
import { LeaderboardUpdateEvent } from '../../gamification/leaderboard/types';
import { RewardAnalytics } from '../../gamification/rewards/types';

/**
 * Background task priorities
 */
export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Background task types
 */
export enum TaskType {
  SYNC = 'sync',
  NOTIFICATION = 'notification',
  PROCESSING = 'processing',
  CACHE = 'cache',
  CLEANUP = 'cleanup',
}

/**
 * Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

/**
 * Task error codes
 */
export enum TaskErrorCode {
  QUEUE_FULL = 'TASK_QUEUE_FULL',
  EXECUTION_FAILED = 'TASK_EXECUTION_FAILED',
  TIMEOUT = 'TASK_TIMEOUT',
  INVALID_STATE = 'TASK_INVALID_STATE',
  DEPENDENCY_FAILED = 'TASK_DEPENDENCY_FAILED',
}

/**
 * Task configuration
 */
export interface TaskConfig {
  maxRetries: number;
  timeout: number;
  priority: TaskPriority;
  dependencies?: string[];
  validateState?: boolean;
}

/**
 * Task metadata
 */
export interface TaskMetadata {
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  attempts: number;
  error?: {
    code: TaskErrorCode | ErrorCode;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
  };
}

/**
 * Base task interface
 */
export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  config: TaskConfig;
  metadata: TaskMetadata;
  execute(): Promise<void>;
  validate(): Promise<boolean>;
  cleanup(): Promise<void>;
}

/**
 * Sync task data
 */
export interface SyncTaskData {
  achievementEvents?: AchievementEvent[];
  leaderboardUpdates?: LeaderboardUpdateEvent[];
  rewardAnalytics?: RewardAnalytics[];
  lastSyncTimestamp?: number;
}

/**
 * Sync task
 */
export interface SyncTask extends Task {
  data: SyncTaskData;
}

/**
 * Notification task data
 */
export interface NotificationTaskData {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification task
 */
export interface NotificationTask extends Task {
  data: NotificationTaskData;
}

/**
 * Processing task data
 */
export interface ProcessingTaskData {
  type: string;
  input: unknown;
  options?: Record<string, unknown>;
}

/**
 * Processing task
 */
export interface ProcessingTask extends Task {
  data: ProcessingTaskData;
}

/**
 * Cache task data
 */
export interface CacheTaskData {
  key: string;
  operation: 'set' | 'delete' | 'clear';
  value?: unknown;
  ttl?: number;
}

/**
 * Cache task
 */
export interface CacheTask extends Task {
  data: CacheTaskData;
}

/**
 * Cleanup task data
 */
export interface CleanupTaskData {
  resource: string;
  olderThan?: number;
  filter?: Record<string, unknown>;
}

/**
 * Cleanup task
 */
export interface CleanupTask extends Task {
  data: CleanupTaskData;
}

/**
 * Task metrics
 */
export interface TaskMetrics {
  totalTasks: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  utilization: number;
  oldestTask: number;
  newestTask: number;
}

/**
 * Worker metrics
 */
export interface WorkerMetrics {
  totalWorkers: number;
  busyWorkers: number;
  idleWorkers: number;
  utilization: number;
  canScale: boolean;
  lastScaleTime: number;
}

/**
 * Task queue interface
 */
export interface TaskQueue {
  add(task: Task): Promise<void>;
  remove(taskId: string): Promise<void>;
  get(taskId: string): Promise<Task | null>;
  list(filter?: Record<string, unknown>): Promise<Task[]>;
  clear(): Promise<void>;
  getMetrics(): TaskMetrics;
  start(): Promise<void>;
  stop(): Promise<void>;
  getNext(): Task | null;
}

/**
 * Worker interface
 */
export interface Worker {
  id: string;
  status: 'idle' | 'busy' | 'stopped';
  currentTask?: Task;
  start(): Promise<void>;
  stop(): Promise<void>;
  process(task: Task): Promise<void>;
}

/**
 * Worker pool interface
 */
export interface WorkerPool {
  addWorker(worker: Worker): void;
  removeWorker(workerId: string): void;
  getAvailableWorker(): Worker | null;
  start(): Promise<void>;
  stop(): Promise<void>;
  getMetrics(): WorkerMetrics;
}

/**
 * Task scheduler interface
 */
export interface TaskScheduler {
  schedule(task: Task): Promise<void>;
  cancel(taskId: string): Promise<void>;
  reschedule(taskId: string, config: TaskConfig): Promise<void>;
}

/**
 * Background service interface
 */
export interface BackgroundService {
  queue: TaskQueue;
  pool: WorkerPool;
  scheduler: TaskScheduler;
  start(): Promise<void>;
  stop(): Promise<void>;
  submit(task: Task): Promise<void>;
  cancel(taskId: string): Promise<void>;
  getMetrics(): Record<string, unknown>;
}
