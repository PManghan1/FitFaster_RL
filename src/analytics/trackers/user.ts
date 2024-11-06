import { analyticsService } from '../../services/analytics';
import { sanitizeErrorDetails } from '../../utils/sanitize';
import { ErrorSeverity, ErrorCategory, ErrorCode } from '../../types/errors';
import type {
  UserEngagementMetrics,
  AnalyticsEvent,
  AnalyticsMetadata,
  AnalyticsEventType,
  CriticalOperations,
} from '../../types/analytics';

interface UserSession {
  id: string;
  startTime: number;
  lastActive: number;
  screenViews: Map<string, number>;
  featureUsage: Map<
    string,
    {
      count: number;
      totalDuration: number;
      lastUsed: number;
    }
  >;
  interactions: number;
  criticalOperations: CriticalOperations;
}

/**
 * User behavior analytics tracker
 */
export class UserAnalyticsTracker {
  private static instance: UserAnalyticsTracker;
  private readonly BATCH_INTERVAL = 60000; // 1 minute
  private readonly MAX_OFFLINE_EVENTS = 1000;

  private currentSession: UserSession | null = null;
  private offlineEvents: AnalyticsEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private isOnline = true;

  private constructor() {
    this.setupNetworkListener();
    this.startBatchProcessing();
  }

  static getInstance(): UserAnalyticsTracker {
    if (!UserAnalyticsTracker.instance) {
      UserAnalyticsTracker.instance = new UserAnalyticsTracker();
    }
    return UserAnalyticsTracker.instance;
  }

  /**
   * Start a new user session
   */
  startSession(userId?: string): void {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      lastActive: Date.now(),
      screenViews: new Map(),
      featureUsage: new Map(),
      interactions: 0,
      criticalOperations: {
        workoutTracking: {
          name: 'Workout Tracking',
          attempts: 0,
          successes: 0,
          successCount: 0,
          failureCount: 0,
          averageTime: 0,
          lastExecuted: Date.now(),
        },
        mealLogging: {
          name: 'Meal Logging',
          attempts: 0,
          successes: 0,
          successCount: 0,
          failureCount: 0,
          averageTime: 0,
          lastExecuted: Date.now(),
        },
      },
    };

    void this.trackEvent('session_start', {
      userId,
      sessionId,
    });
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string): void {
    if (!this.currentSession) {
      this.startSession();
    }

    if (this.currentSession) {
      const views = this.currentSession.screenViews.get(screenName) || 0;
      this.currentSession.screenViews.set(screenName, views + 1);
      this.currentSession.lastActive = Date.now();

      void this.trackEvent('screen_view', {
        screen: screenName,
        viewCount: views + 1,
      });
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUse(featureName: string, operation: () => Promise<unknown>): Promise<void> {
    if (!this.currentSession) {
      this.startSession();
    }

    const startTime = Date.now();
    try {
      await operation();
      if (featureName === 'workoutTracking' || featureName === 'mealLogging') {
        this.updateCriticalOperation(featureName, true, Date.now() - startTime);
      }
    } catch (error) {
      if (featureName === 'workoutTracking' || featureName === 'mealLogging') {
        this.updateCriticalOperation(featureName, false, Date.now() - startTime);
      }
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.recordFeatureUsage(featureName, duration);
    }
  }

  /**
   * Track user interaction
   */
  trackInteraction(interactionType: string, details?: Record<string, unknown>): void {
    if (!this.currentSession) {
      this.startSession();
    }

    if (this.currentSession) {
      this.currentSession.interactions++;
      this.currentSession.lastActive = Date.now();

      void this.trackEvent('feature_use' as AnalyticsEventType, {
        type: interactionType,
        ...details,
      });
    }
  }

  /**
   * Get current session metrics
   */
  getSessionMetrics(): UserEngagementMetrics | null {
    if (!this.currentSession) return null;

    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime;
    const activeTime = now - this.currentSession.lastActive;

    const features = Array.from(this.currentSession.featureUsage.entries()).map(([name, data]) => ({
      name,
      usageCount: data.count,
      averageDuration: data.totalDuration / data.count,
    }));

    return {
      sessionDuration,
      activeTime,
      screenViews: Array.from(this.currentSession.screenViews.values()).reduce(
        (total, views) => total + views,
        0
      ),
      interactions: this.currentSession.interactions,
      features,
      criticalOperations: this.currentSession.criticalOperations,
      timestamp: now,
    };
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.currentSession) {
      void this.trackEvent('session_end', {
        metrics: this.getSessionMetrics(),
      });
      this.currentSession = null;
    }
  }

  private updateCriticalOperation(
    operation: keyof CriticalOperations,
    success: boolean,
    duration: number
  ): void {
    if (!this.currentSession) return;

    const stats = this.currentSession.criticalOperations[operation];
    stats.attempts++;
    if (success) {
      stats.successes++;
      stats.successCount++;
    } else {
      stats.failureCount++;
    }
    stats.averageTime = (stats.averageTime * (stats.attempts - 1) + duration) / stats.attempts;
    stats.lastExecuted = Date.now();
  }

  private recordFeatureUsage(featureName: string, duration: number): void {
    if (!this.currentSession) return;

    const usage = this.currentSession.featureUsage.get(featureName) || {
      count: 0,
      totalDuration: 0,
      lastUsed: 0,
    };

    usage.count++;
    usage.totalDuration += duration;
    usage.lastUsed = Date.now();

    this.currentSession.featureUsage.set(featureName, usage);
    this.currentSession.lastActive = Date.now();

    void this.trackEvent('feature_use', {
      feature: featureName,
      duration,
      usageCount: usage.count,
    });
  }

  private async trackEvent(type: AnalyticsEventType, data: Record<string, unknown>): Promise<void> {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      metadata: this.getEventMetadata(),
      data:
        sanitizeErrorDetails({
          error: new Error(),
          code: ErrorCode.DATA_INVALID,
          severity: ErrorSeverity.LOW,
          category: ErrorCategory.DATA,
          timestamp: Date.now(),
          additionalData: data,
        }).sanitizedData || {},
    };

    if (this.isOnline) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        this.storeOfflineEvent(event);
      }
    } else {
      this.storeOfflineEvent(event);
    }
  }

  private getEventMetadata(): AnalyticsMetadata {
    return {
      sessionId: this.currentSession?.id || 'unknown',
      platform: 'react-native',
      appVersion: '1.0.0', // Should come from app config
      deviceInfo: {
        os: 'unknown',
        version: 'unknown',
        model: 'unknown',
      },
    };
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    await analyticsService.trackError(event.metadata, event.data);
  }

  private storeOfflineEvent(event: AnalyticsEvent): void {
    this.offlineEvents.push(event);
    if (this.offlineEvents.length > this.MAX_OFFLINE_EVENTS) {
      this.offlineEvents.shift();
    }
  }

  private setupNetworkListener(): void {
    // Implementation would depend on network monitoring setup
    // For now, we'll just assume online
    this.isOnline = true;
  }

  private startBatchProcessing(): void {
    this.batchTimeout = setInterval(() => {
      void this.processBatch();
    }, this.BATCH_INTERVAL);
  }

  private async processBatch(): Promise<void> {
    if (!this.isOnline || this.offlineEvents.length === 0) return;

    const batch = this.offlineEvents.splice(0, 100);
    try {
      await Promise.all(batch.map(event => this.sendEvent(event)));
    } catch (error) {
      // Put failed events back in the queue
      this.offlineEvents.unshift(...batch);
    }
  }

  cleanup(): void {
    if (this.batchTimeout) {
      clearInterval(this.batchTimeout);
    }
    this.endSession();
  }
}

export const userAnalytics = UserAnalyticsTracker.getInstance();
