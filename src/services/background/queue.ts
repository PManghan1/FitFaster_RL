import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../analytics';
import { performanceAlerts } from '../../monitoring';
import { Task, TaskQueue, TaskPriority, TaskMetrics, TaskStatus } from './types';

/**
 * Task queue implementation
 */
export class BaseTaskQueue implements TaskQueue {
  private queue: Map<TaskPriority, Task[]> = new Map();
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly QUEUE_WARNING_THRESHOLD = 0.8;
  private isRunning = false;

  constructor() {
    this.initializeQueues();
  }

  /**
   * Add task
   */
  async add(task: Task): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    const priorityQueue = this.queue.get(task.config.priority);
    if (!priorityQueue) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    if (this.getTotalSize() >= this.MAX_QUEUE_SIZE) {
      performanceAlerts.createAlert('api', 'critical', 'Queue size limit reached', {
        size: this.getTotalSize(),
        maximum: this.MAX_QUEUE_SIZE,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    priorityQueue.push(task);
    await this.trackQueueEvent('add', task);
    await this.checkQueueHealth();
  }

  /**
   * Remove task
   */
  async remove(taskId: string): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    let removed = false;
    for (const tasks of this.queue.values()) {
      const index = tasks.findIndex(task => task.id === taskId);
      if (index !== -1) {
        const task = tasks[index];
        tasks.splice(index, 1);
        await this.trackQueueEvent('remove', task);
        removed = true;
        break;
      }
    }

    if (!removed) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }
  }

  /**
   * Get task
   */
  async get(taskId: string): Promise<Task> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    for (const tasks of this.queue.values()) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        return task;
      }
    }

    throw new Error(ErrorCode.WORKER_ERROR);
  }

  /**
   * List tasks
   */
  async list(filter?: Record<string, unknown>): Promise<Task[]> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    let tasks = Array.from(this.queue.values()).flat();

    if (filter) {
      tasks = tasks.filter(task => {
        return Object.entries(filter).every(([key, value]) => {
          if (key === 'priority') {
            return task.config.priority === value;
          }
          if (key === 'type') {
            return task.type === value;
          }
          if (key === 'status') {
            return task.status === value;
          }
          return false;
        });
      });
    }

    return tasks;
  }

  /**
   * Get next task
   */
  getNext(): Task | null {
    if (!this.isRunning) {
      return null;
    }

    // Check queues in priority order
    for (const priority of Object.values(TaskPriority)) {
      const queue = this.queue.get(priority);
      if (queue && queue.length > 0) {
        const task = queue.shift();
        if (task) {
          this.trackQueueEvent('remove', task);
          return task;
        }
      }
    }
    return null;
  }

  /**
   * Start queue
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }
    this.isRunning = true;
    await this.trackQueueEvent('start');
  }

  /**
   * Stop queue
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }
    this.isRunning = false;
    await this.trackQueueEvent('stop');
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    if (!this.isRunning) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }
    this.queue.clear();
    this.initializeQueues();
    await this.trackQueueEvent('clear');
  }

  /**
   * Get queue metrics
   */
  getMetrics(): TaskMetrics {
    const totalTasks = this.getTotalSize();
    const oldestTask = this.getOldestTaskTime() || 0;
    const newestTask = this.getNewestTaskTime() || 0;

    return {
      totalTasks,
      pendingTasks: this.countTasksByStatus(TaskStatus.PENDING),
      runningTasks: this.countTasksByStatus(TaskStatus.RUNNING),
      completedTasks: this.countTasksByStatus(TaskStatus.COMPLETED),
      failedTasks: this.countTasksByStatus(TaskStatus.FAILED),
      utilization: totalTasks / this.MAX_QUEUE_SIZE,
      oldestTask,
      newestTask,
    };
  }

  /**
   * Initialize queues
   */
  private initializeQueues(): void {
    Object.values(TaskPriority).forEach(priority => {
      this.queue.set(priority, []);
    });
  }

  /**
   * Get total queue size
   */
  private getTotalSize(): number {
    return Array.from(this.queue.values()).reduce((total, queue) => total + queue.length, 0);
  }

  /**
   * Get oldest task time
   */
  private getOldestTaskTime(): number | null {
    let oldestTime: number | null = null;

    for (const tasks of this.queue.values()) {
      if (tasks.length > 0) {
        const taskTime = tasks[0].metadata.createdAt;
        if (!oldestTime || taskTime < oldestTime) {
          oldestTime = taskTime;
        }
      }
    }

    return oldestTime;
  }

  /**
   * Get newest task time
   */
  private getNewestTaskTime(): number | null {
    let newestTime: number | null = null;

    for (const tasks of this.queue.values()) {
      if (tasks.length > 0) {
        const taskTime = tasks[tasks.length - 1].metadata.createdAt;
        if (!newestTime || taskTime > newestTime) {
          newestTime = taskTime;
        }
      }
    }

    return newestTime;
  }

  /**
   * Count tasks by status
   */
  private countTasksByStatus(status: TaskStatus): number {
    return Array.from(this.queue.values())
      .flat()
      .filter(task => task.status === status).length;
  }

  /**
   * Check queue health
   */
  private async checkQueueHealth(): Promise<void> {
    const metrics = this.getMetrics();
    const isNearCapacity = metrics.utilization >= this.QUEUE_WARNING_THRESHOLD;

    if (isNearCapacity) {
      performanceAlerts.createAlert('api', 'warning', 'High queue utilization', {
        utilization: metrics.utilization,
        threshold: this.QUEUE_WARNING_THRESHOLD,
        totalTasks: metrics.totalTasks,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
      });
    }

    // Check for stale tasks
    const now = Date.now();
    const staleDuration = 300000; // 5 minutes
    if (metrics.oldestTask > 0 && now - metrics.oldestTask > staleDuration) {
      performanceAlerts.createAlert('api', 'warning', 'Stale tasks detected', {
        oldestTask: metrics.oldestTask,
        staleDuration,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.MEDIUM,
      });
    }
  }

  /**
   * Track queue event
   */
  private async trackQueueEvent(
    type: 'add' | 'remove' | 'clear' | 'start' | 'stop',
    task?: Task
  ): Promise<void> {
    const metrics = this.getMetrics();

    await analyticsService.trackError(
      {
        sessionId: `queue_${Date.now()}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Task queue ${type}`,
      },
      {
        type,
        taskId: task?.id,
        taskType: task?.type,
        priority: task?.config.priority,
        totalTasks: metrics.totalTasks,
        utilization: metrics.utilization,
        pendingTasks: metrics.pendingTasks,
        runningTasks: metrics.runningTasks,
        completedTasks: metrics.completedTasks,
        failedTasks: metrics.failedTasks,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.LOW,
      }
    );
  }
}

/**
 * Create task queue
 */
export function createTaskQueue(): TaskQueue {
  return new BaseTaskQueue();
}
