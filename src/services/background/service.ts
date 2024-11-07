import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../analytics';
import { performanceAlerts } from '../../monitoring';
import { Task, BackgroundService, TaskConfig, TaskQueue, WorkerPool, TaskScheduler } from './types';
import { createWorkerPool } from './pool';
import { createTaskQueue } from './queue';

/**
 * Background service implementation
 */
export class BaseBackgroundService implements BackgroundService {
  private static instance: BaseBackgroundService;
  public readonly queue: TaskQueue;
  public readonly pool: WorkerPool;
  public readonly scheduler: TaskScheduler;
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 1000; // 1 second

  private constructor() {
    this.queue = createTaskQueue();
    this.pool = createWorkerPool();
    this.scheduler = this.createScheduler();
  }

  static getInstance(): BackgroundService {
    if (!BaseBackgroundService.instance) {
      BaseBackgroundService.instance = new BaseBackgroundService();
    }
    return BaseBackgroundService.instance;
  }

  /**
   * Start service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    try {
      await this.queue.start();
      await this.pool.start();
      this.isRunning = true;
      this.startTaskProcessing();
      await this.trackServiceEvent('start');
    } catch (error) {
      performanceAlerts.createAlert('api', 'critical', 'Background service failed to start', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw error;
    }
  }

  /**
   * Stop service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    try {
      this.stopTaskProcessing();
      await this.pool.stop();
      await this.queue.stop();
      this.isRunning = false;
      await this.trackServiceEvent('stop');
    } catch (error) {
      performanceAlerts.createAlert('api', 'critical', 'Background service failed to stop', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw error;
    }
  }

  /**
   * Submit task
   */
  async submit(task: Task): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    try {
      await this.queue.add(task);
      await this.trackServiceEvent('submit', { taskId: task.id });
    } catch (error) {
      performanceAlerts.createAlert('api', 'critical', 'Failed to submit task', {
        taskId: task.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw error;
    }
  }

  /**
   * Cancel task
   */
  async cancel(taskId: string): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    try {
      await this.queue.remove(taskId);
      await this.trackServiceEvent('cancel', { taskId });
    } catch (error) {
      performanceAlerts.createAlert('api', 'critical', 'Failed to cancel task', {
        taskId,
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw error;
    }
  }

  /**
   * Get service metrics
   */
  getMetrics(): Record<string, unknown> {
    const queueMetrics = this.queue.getMetrics();
    const poolMetrics = this.pool.getMetrics();

    return {
      queue: queueMetrics,
      pool: poolMetrics,
      isRunning: this.isRunning,
      processingEnabled: this.processingInterval !== null,
    };
  }

  /**
   * Create scheduler
   */
  private createScheduler(): TaskScheduler {
    return {
      schedule: async (task: Task): Promise<void> => {
        await this.submit(task);
      },
      cancel: async (taskId: string): Promise<void> => {
        await this.cancel(taskId);
      },
      reschedule: async (taskId: string, config: TaskConfig): Promise<void> => {
        const task = await this.queue.get(taskId);
        if (!task) {
          throw new Error(ErrorCode.WORKER_ERROR);
        }

        await this.cancel(taskId);
        task.config = { ...task.config, ...config };
        await this.submit(task);
      },
    };
  }

  /**
   * Start task processing
   */
  private startTaskProcessing(): void {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(async () => {
      try {
        await this.processPendingTasks();
      } catch (error) {
        performanceAlerts.createAlert('api', 'critical', 'Task processing failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          category: ErrorCategory.WORKER,
          severity: ErrorSeverity.HIGH,
        });
      }
    }, this.PROCESSING_INTERVAL);
  }

  /**
   * Stop task processing
   */
  private stopTaskProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Process pending tasks
   */
  private async processPendingTasks(): Promise<void> {
    const worker = this.pool.getAvailableWorker();
    if (!worker) {
      return;
    }

    const task = this.queue.getNext();
    if (!task) {
      return;
    }

    try {
      await worker.process(task);
      await this.trackServiceEvent('complete', { taskId: task.id });
    } catch (error) {
      performanceAlerts.createAlert('api', 'critical', 'Task processing failed', {
        taskId: task.id,
        workerId: worker.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw error;
    }
  }

  /**
   * Track service event
   */
  private async trackServiceEvent(
    type: 'start' | 'stop' | 'submit' | 'cancel' | 'complete',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const metrics = this.getMetrics();

    await analyticsService.trackError(
      {
        sessionId: `service_${Date.now()}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Background service ${type}`,
      },
      {
        type,
        ...metadata,
        metrics,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.LOW,
      }
    );
  }
}

/**
 * Create background service
 */
export function createBackgroundService(): BackgroundService {
  return BaseBackgroundService.getInstance();
}
