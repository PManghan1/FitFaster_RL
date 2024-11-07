import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../analytics';
import { performanceAlerts } from '../../monitoring';
import { Task, TaskStatus, TaskErrorCode, Worker } from './types';

/**
 * Base worker implementation
 */
export class BaseWorker implements Worker {
  public id: string;
  public status: 'idle' | 'busy' | 'stopped';
  public currentTask?: Task;
  private readonly MAX_EXECUTION_TIME = 300000; // 5 minutes
  private readonly PERFORMANCE_THRESHOLD = 1000; // 1 second

  constructor(id: string) {
    this.id = id;
    this.status = 'idle';
  }

  /**
   * Start worker
   */
  async start(): Promise<void> {
    if (this.status !== 'stopped') {
      throw new Error(TaskErrorCode.INVALID_STATE);
    }
    this.status = 'idle';
    await this.trackWorkerEvent('start');
  }

  /**
   * Stop worker
   */
  async stop(): Promise<void> {
    if (this.status === 'stopped') {
      throw new Error(TaskErrorCode.INVALID_STATE);
    }
    if (this.currentTask) {
      await this.handleTaskFailure(
        this.currentTask,
        new Error(TaskErrorCode.EXECUTION_FAILED),
        TaskErrorCode.EXECUTION_FAILED,
        ErrorCategory.WORKER,
        ErrorSeverity.HIGH
      );
    }
    this.status = 'stopped';
    await this.trackWorkerEvent('stop');
  }

  /**
   * Process task
   */
  async process(task: Task): Promise<void> {
    const startTime = performance.now();

    try {
      // Validate worker state
      if (this.status !== 'idle') {
        throw new Error(TaskErrorCode.INVALID_STATE);
      }

      // Update state
      this.status = 'busy';
      this.currentTask = task;
      task.status = TaskStatus.RUNNING;
      task.metadata.startedAt = Date.now();

      // Track start
      await this.trackTaskEvent('start', task);

      // Validate task
      if (task.config.validateState) {
        const valid = await task.validate();
        if (!valid) {
          throw new Error(TaskErrorCode.INVALID_STATE);
        }
      }

      // Execute with timeout
      await Promise.race([
        task.execute(),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(TaskErrorCode.TIMEOUT));
          }, this.MAX_EXECUTION_TIME);
        }),
      ]);

      // Update state
      task.status = TaskStatus.COMPLETED;
      task.metadata.completedAt = Date.now();

      // Cleanup
      await task.cleanup();

      // Track completion
      await this.trackTaskEvent('complete', task);

      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > this.PERFORMANCE_THRESHOLD) {
        performanceAlerts.createAlert('api', 'warning', 'Slow task execution', {
          duration,
          taskType: task.type,
          workerId: this.id,
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
        });
      }
    } catch (error) {
      // Handle failure
      const errorCode =
        error instanceof Error &&
        Object.values(TaskErrorCode).includes(error.message as TaskErrorCode)
          ? (error.message as TaskErrorCode)
          : TaskErrorCode.EXECUTION_FAILED;

      await this.handleTaskFailure(
        task,
        error,
        errorCode,
        ErrorCategory.WORKER,
        ErrorSeverity.HIGH
      );

      // Monitor performance issue
      performanceAlerts.createAlert('api', 'critical', 'Task execution failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskType: task.type,
        workerId: this.id,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });

      throw error;
    } finally {
      // Reset state
      this.status = 'idle';
      this.currentTask = undefined;
    }
  }

  /**
   * Handle task failure
   */
  private async handleTaskFailure(
    task: Task,
    error: unknown,
    code: TaskErrorCode | ErrorCode,
    category: ErrorCategory,
    severity: ErrorSeverity
  ): Promise<void> {
    // Update task state
    task.status = TaskStatus.FAILED;
    task.metadata.error = {
      code,
      message: error instanceof Error ? error.message : 'Unknown error',
      category,
      severity,
    };

    // Track failure
    await this.trackTaskEvent('fail', task);

    // Check retry
    if (task.metadata.attempts < task.config.maxRetries) {
      task.status = TaskStatus.RETRYING;
      task.metadata.attempts++;
    }
  }

  /**
   * Track worker event
   */
  private async trackWorkerEvent(type: 'start' | 'stop', error?: Error): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `worker_${Date.now()}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Worker ${type}: ${this.id}`,
      },
      {
        type,
        workerId: this.id,
        status: this.status,
        error: error?.message,
        category: ErrorCategory.WORKER,
        severity: error ? ErrorSeverity.HIGH : ErrorSeverity.LOW,
      }
    );
  }

  /**
   * Track task event
   */
  private async trackTaskEvent(type: 'start' | 'complete' | 'fail', task: Task): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `task_${task.metadata.createdAt}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Task ${type}: ${task.id}`,
      },
      {
        type,
        taskId: task.id,
        taskType: task.type,
        workerId: this.id,
        status: task.status,
        priority: task.config.priority,
        duration: task.metadata.completedAt
          ? task.metadata.completedAt - (task.metadata.startedAt || 0)
          : undefined,
        error: task.metadata.error,
        category: ErrorCategory.WORKER,
        severity:
          type === 'fail' ? task.metadata.error?.severity || ErrorSeverity.HIGH : ErrorSeverity.LOW,
      }
    );
  }
}

/**
 * Create worker factory
 */
export function createWorker(id: string): Worker {
  return new BaseWorker(id);
}
