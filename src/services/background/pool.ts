import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../analytics';
import { performanceAlerts } from '../../monitoring';
import { Worker, WorkerPool, WorkerMetrics } from './types';
import { createWorker } from './worker';

/**
 * Worker pool implementation
 */
export class BaseWorkerPool implements WorkerPool {
  private workers: Map<string, Worker> = new Map();
  private readonly MIN_WORKERS = 2;
  private readonly MAX_WORKERS = 10;
  private readonly SCALE_THRESHOLD = 0.8; // 80% utilization
  private readonly SCALE_COOLDOWN = 60000; // 1 minute
  private lastScaleTime = 0;

  constructor(initialWorkers = 2) {
    if (initialWorkers < this.MIN_WORKERS) {
      performanceAlerts.createAlert('api', 'warning', 'Worker pool initialized below minimum', {
        requested: initialWorkers,
        minimum: this.MIN_WORKERS,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.MEDIUM,
      });
      initialWorkers = this.MIN_WORKERS;
    }
    this.initializeWorkers(initialWorkers);
  }

  /**
   * Add worker
   */
  addWorker(worker: Worker): void {
    if (this.workers.size >= this.MAX_WORKERS) {
      performanceAlerts.createAlert('api', 'warning', 'Maximum worker limit reached', {
        current: this.workers.size,
        maximum: this.MAX_WORKERS,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.MEDIUM,
      });
      throw new Error(ErrorCode.WORKER_ERROR);
    }
    this.workers.set(worker.id, worker);
    this.trackPoolEvent('add_worker', { workerId: worker.id });
  }

  /**
   * Remove worker
   */
  removeWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(ErrorCode.WORKER_ERROR);
    }
    if (worker.status === 'busy') {
      performanceAlerts.createAlert('api', 'warning', 'Attempting to remove busy worker', {
        workerId,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.HIGH,
      });
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    if (this.workers.size <= this.MIN_WORKERS) {
      performanceAlerts.createAlert('api', 'warning', 'Cannot remove worker below minimum', {
        current: this.workers.size,
        minimum: this.MIN_WORKERS,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.MEDIUM,
      });
      throw new Error(ErrorCode.WORKER_ERROR);
    }

    this.workers.delete(workerId);
    this.trackPoolEvent('remove_worker', { workerId });
  }

  /**
   * Get available worker
   */
  getAvailableWorker(): Worker | null {
    // First try to find an idle worker
    for (const worker of this.workers.values()) {
      if (worker.status === 'idle') {
        return worker;
      }
    }

    // Check if we can scale up
    if (this.canScaleUp()) {
      const newWorker = createWorker(`worker_${this.workers.size + 1}`);
      this.addWorker(newWorker);
      return newWorker;
    }

    // Monitor high utilization
    const busyWorkers = Array.from(this.workers.values()).filter(
      worker => worker.status === 'busy'
    ).length;
    if (busyWorkers === this.workers.size) {
      performanceAlerts.createAlert('api', 'warning', 'All workers busy', {
        totalWorkers: this.workers.size,
        busyWorkers,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
      });
    }

    return null;
  }

  /**
   * Start pool
   */
  async start(): Promise<void> {
    const startPromises = Array.from(this.workers.values()).map(worker =>
      worker.start().catch(error => {
        performanceAlerts.createAlert('api', 'critical', 'Worker failed to start', {
          workerId: worker.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          category: ErrorCategory.WORKER,
          severity: ErrorSeverity.HIGH,
        });
        throw error;
      })
    );
    await Promise.all(startPromises);
    this.trackPoolEvent('start');
  }

  /**
   * Stop pool
   */
  async stop(): Promise<void> {
    const stopPromises = Array.from(this.workers.values()).map(worker =>
      worker.stop().catch(error => {
        performanceAlerts.createAlert('api', 'critical', 'Worker failed to stop', {
          workerId: worker.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          category: ErrorCategory.WORKER,
          severity: ErrorSeverity.HIGH,
        });
        throw error;
      })
    );
    await Promise.all(stopPromises);
    this.trackPoolEvent('stop');
  }

  /**
   * Initialize workers
   */
  private initializeWorkers(count: number): void {
    for (let i = 0; i < count; i++) {
      const worker = createWorker(`worker_${i + 1}`);
      this.addWorker(worker);
    }
  }

  /**
   * Check if pool can scale up
   */
  private canScaleUp(): boolean {
    if (this.workers.size >= this.MAX_WORKERS) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastScaleTime < this.SCALE_COOLDOWN) {
      return false;
    }

    const busyWorkers = Array.from(this.workers.values()).filter(
      worker => worker.status === 'busy'
    ).length;
    const utilization = busyWorkers / this.workers.size;

    if (utilization >= this.SCALE_THRESHOLD) {
      this.lastScaleTime = now;
      return true;
    }

    return false;
  }

  /**
   * Track pool event
   */
  private async trackPoolEvent(
    type: 'start' | 'stop' | 'add_worker' | 'remove_worker',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const metrics = this.getMetrics();

    await analyticsService.trackError(
      {
        sessionId: `pool_${Date.now()}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Worker pool ${type}`,
      },
      {
        type,
        ...metadata,
        totalWorkers: metrics.totalWorkers,
        busyWorkers: metrics.busyWorkers,
        idleWorkers: metrics.idleWorkers,
        utilization: metrics.utilization,
        canScale: metrics.canScale,
        lastScaleTime: metrics.lastScaleTime,
        category: ErrorCategory.WORKER,
        severity: ErrorSeverity.LOW,
      }
    );
  }

  /**
   * Get pool metrics
   */
  getMetrics(): WorkerMetrics {
    const busyWorkers = Array.from(this.workers.values()).filter(
      worker => worker.status === 'busy'
    ).length;
    const idleWorkers = this.workers.size - busyWorkers;
    const utilization = busyWorkers / this.workers.size;

    return {
      totalWorkers: this.workers.size,
      busyWorkers,
      idleWorkers,
      utilization,
      canScale: this.canScaleUp(),
      lastScaleTime: this.lastScaleTime,
    };
  }
}

/**
 * Create worker pool
 */
export function createWorkerPool(initialWorkers = 2): WorkerPool {
  return new BaseWorkerPool(initialWorkers);
}
