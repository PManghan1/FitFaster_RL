import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../../services/analytics';
import { performanceAlerts } from '../../monitoring';
import {
  Achievement,
  AchievementEvent,
  AchievementProgress,
  AchievementStorage,
  AchievementProcessor,
  AchievementTrigger,
  AchievementErrorCode,
} from './types';

/**
 * Achievement categories configuration
 */
const CATEGORY_CONFIGS = {
  workout: {
    metrics: ['completions', 'totalSets', 'totalWeight', 'duration'],
    streakWindow: 24 * 60 * 60 * 1000, // 24 hours
    triggers: [AchievementTrigger.COUNT, AchievementTrigger.STREAK],
  },
  nutrition: {
    metrics: ['mealCount', 'calorieGoals', 'proteinGoals', 'waterIntake'],
    streakWindow: 24 * 60 * 60 * 1000, // 24 hours
    triggers: [AchievementTrigger.COUNT, AchievementTrigger.MILESTONE],
  },
  supplement: {
    metrics: ['adherence', 'consistency', 'combinations'],
    streakWindow: 24 * 60 * 60 * 1000, // 24 hours
    triggers: [AchievementTrigger.STREAK, AchievementTrigger.COMPOUND],
  },
  streak: {
    metrics: ['daysActive', 'perfectWeeks', 'perfectMonths'],
    streakWindow: 24 * 60 * 60 * 1000, // 24 hours
    triggers: [AchievementTrigger.STREAK],
  },
  social: {
    metrics: ['interactions', 'shares', 'motivations', 'challenges'],
    streakWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
    triggers: [AchievementTrigger.COUNT, AchievementTrigger.SPECIAL],
  },
  milestone: {
    metrics: ['weightLost', 'strengthGained', 'habitsFormed'],
    streakWindow: 30 * 24 * 60 * 60 * 1000, // 30 days
    triggers: [AchievementTrigger.MILESTONE],
  },
};

/**
 * Achievement progress tracker
 */
export class AchievementProgressTracker {
  private static instance: AchievementProgressTracker;
  private readonly SYNC_INTERVAL = 60000; // 1 minute
  private readonly MAX_OFFLINE_EVENTS = 1000;
  private readonly CACHE_DURATION = 300000; // 5 minutes
  private offlineEvents: AchievementEvent[] = [];
  private syncTimeout: NodeJS.Timeout | null = null;
  private isOnline = true;
  private achievements: Map<string, { achievement: Achievement; timestamp: number }> = new Map();

  private constructor(
    private storage: AchievementStorage,
    private processor: AchievementProcessor
  ) {
    this.setupNetworkListener();
    this.startSyncProcess();
  }

  static getInstance(
    storage: AchievementStorage,
    processor: AchievementProcessor
  ): AchievementProgressTracker {
    if (!AchievementProgressTracker.instance) {
      AchievementProgressTracker.instance = new AchievementProgressTracker(storage, processor);
    }
    return AchievementProgressTracker.instance;
  }

  /**
   * Track achievement progress
   */
  async trackProgress(event: AchievementEvent): Promise<AchievementProgress> {
    const startTime = performance.now();

    try {
      // Process event
      if (this.isOnline) {
        const progress = await this.processor.processEvent(event);
        await this.trackAnalytics(event, progress);
        // Cache achievement data
        const achievement = this.processor.getAchievement(event.achievementId);
        if (achievement) {
          this.cacheAchievement(achievement);
        }
        return progress;
      } else {
        if (!this.validateOfflineEvent(event)) {
          throw new Error(AchievementErrorCode.VALIDATION_FAILED);
        }
        this.storeOfflineEvent(event);
        return this.getOfflineProgress(event);
      }
    } catch (error) {
      // Monitor performance issue
      performanceAlerts.createAlert(
        'api',
        'critical',
        `Achievement progress tracking failed: ${event.achievementId}`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          category: ErrorCategory.DATA,
          severity: ErrorSeverity.HIGH,
          code:
            error instanceof Error && error.message === AchievementErrorCode.VALIDATION_FAILED
              ? AchievementErrorCode.VALIDATION_FAILED
              : ErrorCode.DATA_CORRUPT,
        }
      );

      throw error;
    } finally {
      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > 100) {
        // 100ms threshold
        performanceAlerts.createAlert(
          'api',
          'warning',
          `Slow achievement progress tracking: ${event.achievementId}`,
          {
            duration,
            category: ErrorCategory.PERFORMANCE,
            severity: ErrorSeverity.MEDIUM,
          }
        );
      }
    }
  }

  /**
   * Get category progress
   */
  async getCategoryProgress(
    userId: string,
    category: keyof typeof CATEGORY_CONFIGS
  ): Promise<AchievementProgress[]> {
    const config = CATEGORY_CONFIGS[category];
    if (!config) {
      throw new Error(AchievementErrorCode.INVALID_PROGRESS);
    }

    try {
      const achievements = await this.storage.listUserAchievements(userId);
      return achievements.filter(progress => {
        const achievement = this.getCachedAchievement(progress.achievementId);
        if (!achievement) {
          performanceAlerts.createAlert(
            'api',
            'warning',
            `Achievement not found: ${progress.achievementId}`,
            {
              category: ErrorCategory.DATA,
              severity: ErrorSeverity.LOW,
              code: ErrorCode.DATA_CORRUPT,
            }
          );
          return false;
        }
        return achievement.category === category;
      });
    } catch (error) {
      performanceAlerts.createAlert(
        'api',
        'critical',
        `Failed to fetch category progress: ${category}`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          category: ErrorCategory.DATA,
          severity: ErrorSeverity.HIGH,
          code: ErrorCode.DATA_CORRUPT,
        }
      );
      throw error;
    }
  }

  /**
   * Cache achievement data
   */
  private cacheAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, {
      achievement,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached achievement
   */
  private getCachedAchievement(achievementId: string): Achievement | null {
    const cached = this.achievements.get(achievementId);
    if (!cached) {
      const achievement = this.processor.getAchievement(achievementId);
      if (achievement) {
        this.cacheAchievement(achievement);
        return achievement;
      }
      return null;
    }

    // Check cache expiry
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.achievements.delete(achievementId);
      const achievement = this.processor.getAchievement(achievementId);
      if (achievement) {
        this.cacheAchievement(achievement);
        return achievement;
      }
      return null;
    }

    return cached.achievement;
  }

  /**
   * Validate offline event
   */
  private validateOfflineEvent(event: AchievementEvent): boolean {
    const achievement = this.getCachedAchievement(event.achievementId);
    if (!achievement) return false;

    const config = CATEGORY_CONFIGS[achievement.category as keyof typeof CATEGORY_CONFIGS];
    if (!config) return false;

    return config.triggers.includes(achievement.requirements[0]?.type);
  }

  /**
   * Store offline event
   */
  private storeOfflineEvent(event: AchievementEvent): void {
    this.offlineEvents.push(event);
    if (this.offlineEvents.length > this.MAX_OFFLINE_EVENTS) {
      this.offlineEvents.shift();
    }
  }

  /**
   * Get offline progress
   */
  private async getOfflineProgress(event: AchievementEvent): Promise<AchievementProgress> {
    const progress = await this.storage.getProgress(event.userId, event.achievementId);
    if (!progress) {
      return {
        achievementId: event.achievementId,
        userId: event.userId,
        progress: [],
        completed: false,
        lastUpdated: Date.now(),
      };
    }
    return progress;
  }

  /**
   * Track analytics
   */
  private async trackAnalytics(
    event: AchievementEvent,
    progress: AchievementProgress
  ): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `achievement_${event.timestamp}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Achievement progress: ${event.achievementId}`,
      },
      {
        type: event.type,
        achievementId: event.achievementId,
        userId: event.userId,
        progress: progress.progress,
        completed: progress.completed,
        metadata: event.metadata,
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.LOW,
      }
    );
  }

  /**
   * Setup network listener
   */
  private setupNetworkListener(): void {
    // Implementation would depend on network monitoring setup
    // For now, we'll just assume online
    this.isOnline = true;
  }

  /**
   * Start sync process
   */
  private startSyncProcess(): void {
    this.syncTimeout = setInterval(() => {
      void this.syncOfflineEvents();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Sync offline events
   */
  private async syncOfflineEvents(): Promise<void> {
    if (!this.isOnline || this.offlineEvents.length === 0) return;

    const events = [...this.offlineEvents];
    this.offlineEvents = [];

    try {
      await Promise.all(events.map(event => this.processor.processEvent(event)));
    } catch (error) {
      // Put failed events back in the queue
      this.offlineEvents.unshift(...events);
      performanceAlerts.createAlert('api', 'critical', 'Failed to sync offline events', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.SYNC,
        severity: ErrorSeverity.HIGH,
        code: ErrorCode.SYNC_FAILED,
      });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.syncTimeout) {
      clearInterval(this.syncTimeout);
    }
    this.achievements.clear();
  }
}
