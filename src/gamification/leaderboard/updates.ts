import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { performanceAlerts } from '../../monitoring';
import {
  LeaderboardCategory,
  LeaderboardTimeframe,
  LeaderboardUpdateEvent,
  LeaderboardNotification,
  LeaderboardErrorCode,
} from './types';

type UpdateCallback = (event: LeaderboardUpdateEvent) => void;
type NotificationCallback = (notification: LeaderboardNotification) => void;

/**
 * Real-time leaderboard updates
 */
export class LeaderboardUpdates {
  private static instance: LeaderboardUpdates;
  private updateListeners: Map<string, Set<UpdateCallback>> = new Map();
  private notificationListeners: Map<string, Set<NotificationCallback>> = new Map();
  private connectionRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 5;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {
    this.setupRealtimeConnection();
  }

  static getInstance(): LeaderboardUpdates {
    if (!LeaderboardUpdates.instance) {
      LeaderboardUpdates.instance = new LeaderboardUpdates();
    }
    return LeaderboardUpdates.instance;
  }

  /**
   * Subscribe to updates for a category
   */
  subscribeToUpdates(
    category: LeaderboardCategory,
    timeframe: LeaderboardTimeframe,
    callback: UpdateCallback
  ): () => void {
    const key = this.getSubscriptionKey(category, timeframe);
    if (!this.updateListeners.has(key)) {
      this.updateListeners.set(key, new Set());
    }
    this.updateListeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.updateListeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.updateListeners.delete(key);
        }
      }
    };
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(userId: string, callback: NotificationCallback): () => void {
    if (!this.notificationListeners.has(userId)) {
      this.notificationListeners.set(userId, new Set());
    }
    this.notificationListeners.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.notificationListeners.get(userId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.notificationListeners.delete(userId);
        }
      }
    };
  }

  /**
   * Handle update event
   */
  handleUpdate(event: LeaderboardUpdateEvent): void {
    const startTime = performance.now();

    try {
      // Get relevant listeners
      const key = this.getSubscriptionKey(event.category, event.timeframe);
      const listeners = this.updateListeners.get(key);

      if (listeners) {
        // Notify all listeners
        listeners.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            this.handleError(
              error,
              ErrorCategory.DATA,
              ErrorSeverity.MEDIUM,
              'Error in update listener'
            );
          }
        });
      }

      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > 50) {
        // 50ms threshold for real-time updates
        performanceAlerts.createAlert(
          'api',
          'warning',
          `Slow update processing: ${event.category}`,
          { duration }
        );
      }
    } catch (error) {
      this.handleError(
        error,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.CRITICAL,
        'Update processing failed'
      );
    }
  }

  /**
   * Handle notification
   */
  handleNotification(notification: LeaderboardNotification): void {
    const startTime = performance.now();

    try {
      // Get relevant listeners
      const listeners = this.notificationListeners.get(notification.userId);

      if (listeners) {
        // Notify all listeners
        listeners.forEach(callback => {
          try {
            callback(notification);
          } catch (error) {
            this.handleError(
              error,
              ErrorCategory.DATA,
              ErrorSeverity.MEDIUM,
              'Error in notification listener'
            );
          }
        });
      }

      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > 50) {
        // 50ms threshold for real-time notifications
        performanceAlerts.createAlert(
          'api',
          'warning',
          `Slow notification processing: ${notification.type}`,
          { duration }
        );
      }
    } catch (error) {
      this.handleError(
        error,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.CRITICAL,
        'Notification processing failed'
      );
    }
  }

  /**
   * Setup realtime connection
   */
  private setupRealtimeConnection(): void {
    try {
      // Implementation would depend on real-time service (e.g., WebSocket)
      // For now, we'll just simulate real-time updates
      console.info('Setting up real-time connection...');

      // Handle connection success
      this.connectionRetryCount = 0;

      // Setup event handlers
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(
        error,
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        'Real-time connection failed'
      );
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Implementation would depend on real-time service
    // For now, we'll just set up placeholder handlers
    console.info('Setting up event handlers...');
  }

  /**
   * Handle error
   */
  private handleError(
    error: unknown,
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string
  ): void {
    console.error(message, error);

    performanceAlerts.createAlert(
      'api',
      severity === ErrorSeverity.CRITICAL ? 'critical' : 'warning',
      message,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        category,
        code: error instanceof Error ? ErrorCode.DATA_CORRUPT : LeaderboardErrorCode.UPDATE_FAILED,
      }
    );

    // Attempt reconnection with exponential backoff
    if (category === ErrorCategory.NETWORK && this.connectionRetryCount < this.MAX_RETRY_ATTEMPTS) {
      this.connectionRetryCount++;
      const delay = this.RETRY_DELAY * Math.pow(2, this.connectionRetryCount - 1);

      setTimeout(() => {
        this.setupRealtimeConnection();
      }, delay);
    }
  }

  /**
   * Get subscription key
   */
  private getSubscriptionKey(
    category: LeaderboardCategory,
    timeframe: LeaderboardTimeframe
  ): string {
    return `${category}:${timeframe}`;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.updateListeners.clear();
    this.notificationListeners.clear();
    // Additional cleanup would depend on real-time service
  }
}

export const leaderboardUpdates = LeaderboardUpdates.getInstance();
