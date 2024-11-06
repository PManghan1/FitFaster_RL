import { ErrorCode } from '../../types/errors';
import { analyticsService } from '../../services/analytics';
import {
  Achievement,
  AchievementEvent,
  AchievementProgress,
  AchievementValidation,
  AchievementErrorCode,
  AchievementTrigger,
  AchievementProcessor,
  AchievementStorage,
  AchievementAnalytics,
  AchievementNotification,
} from './types';

/**
 * Base achievement processor implementation
 */
export abstract class BaseAchievementProcessor implements AchievementProcessor {
  constructor(
    protected achievement: Achievement,
    protected storage: AchievementStorage
  ) {}

  /**
   * Get achievement
   */
  getAchievement(achievementId: string): Achievement | null {
    return this.achievement.id === achievementId ? this.achievement : null;
  }

  /**
   * Process achievement event
   */
  async processEvent(event: AchievementEvent): Promise<AchievementProgress> {
    try {
      // Get current progress
      const currentProgress =
        (await this.storage.getProgress(event.userId, event.achievementId)) ||
        this.initializeProgress(event.userId);

      // Skip if already completed
      if (currentProgress.completed) {
        return currentProgress;
      }

      // Update progress based on event
      const updatedProgress = await this.updateProgress(currentProgress, event);

      // Validate updated progress
      const validation = await this.validateProgress(updatedProgress);
      if (!validation.valid) {
        await this.trackError(validation, event);
        return currentProgress;
      }

      // Check for completion
      const completed = await this.checkCompletion(updatedProgress);
      if (completed) {
        updatedProgress.completed = true;
        updatedProgress.completedAt = Date.now();
        await this.handleCompletion(updatedProgress);
      }

      // Save progress
      await this.storage.updateProgress(updatedProgress);

      // Track analytics
      await this.trackProgress(updatedProgress, event);

      return updatedProgress;
    } catch (error) {
      // Track error
      await this.trackError(
        {
          valid: false,
          errorCode: ErrorCode.DATA_CORRUPT,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
        event
      );

      throw error;
    }
  }

  /**
   * Validate achievement progress
   */
  async validateProgress(progress: AchievementProgress): Promise<AchievementValidation> {
    // Check if expired
    if (this.achievement.expiresAt && Date.now() > this.achievement.expiresAt) {
      return {
        valid: false,
        errorCode: AchievementErrorCode.EXPIRED,
        errorMessage: 'Achievement has expired',
      };
    }

    // Check prerequisites
    const prerequisites = this.achievement.requirements.flatMap(req => req.prerequisites || []);

    if (prerequisites.length > 0) {
      const prerequisiteProgress = await Promise.all(
        prerequisites.map(id => this.storage.getProgress(progress.userId, id))
      );

      if (prerequisiteProgress.some(p => !p?.completed)) {
        return {
          valid: false,
          errorCode: AchievementErrorCode.PREREQUISITES_NOT_MET,
          errorMessage: 'Prerequisites not met',
        };
      }
    }

    // Validate progress values
    if (!this.validateProgressValues(progress)) {
      return {
        valid: false,
        errorCode: AchievementErrorCode.INVALID_PROGRESS,
        errorMessage: 'Invalid progress values',
      };
    }

    return { valid: true };
  }

  /**
   * Check achievement completion
   */
  async checkCompletion(progress: AchievementProgress): Promise<boolean> {
    if (progress.completed) return true;

    return this.achievement.requirements.every((req, index) => {
      const currentProgress = progress.progress[index] || 0;
      return currentProgress >= req.target;
    });
  }

  /**
   * Initialize new progress
   */
  protected initializeProgress(userId: string): AchievementProgress {
    return {
      achievementId: this.achievement.id,
      userId,
      progress: new Array(this.achievement.requirements.length).fill(0),
      completed: false,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Update progress based on event
   */
  protected abstract updateProgress(
    currentProgress: AchievementProgress,
    event: AchievementEvent
  ): Promise<AchievementProgress>;

  /**
   * Validate progress values
   */
  protected abstract validateProgressValues(progress: AchievementProgress): boolean;

  /**
   * Handle achievement completion
   */
  protected async handleCompletion(progress: AchievementProgress): Promise<void> {
    // Create completion notification
    const notification: AchievementNotification = {
      type: 'unlock',
      achievementId: this.achievement.id,
      userId: progress.userId,
      title: this.achievement.title,
      message: `Achievement unlocked: ${this.achievement.title}`,
      reward: this.achievement.reward,
      timestamp: Date.now(),
    };

    // Track completion analytics
    const analytics: AchievementAnalytics = {
      type: 'completion',
      achievementId: this.achievement.id,
      userId: progress.userId,
      category: this.achievement.category,
      difficulty: this.achievement.difficulty,
      progress: progress.progress,
      metadata: {
        completedAt: progress.completedAt,
        reward: this.achievement.reward,
      },
      timestamp: Date.now(),
    };

    await Promise.all([this.trackAnalytics(analytics), this.notifyCompletion(notification)]);
  }

  /**
   * Track progress analytics
   */
  protected async trackProgress(
    progress: AchievementProgress,
    event: AchievementEvent
  ): Promise<void> {
    const analytics: AchievementAnalytics = {
      type: 'progress',
      achievementId: this.achievement.id,
      userId: progress.userId,
      category: this.achievement.category,
      difficulty: this.achievement.difficulty,
      progress: progress.progress,
      metadata: event.metadata,
      timestamp: Date.now(),
    };

    await this.trackAnalytics(analytics);
  }

  /**
   * Track error analytics
   */
  protected async trackError(
    validation: AchievementValidation,
    event: AchievementEvent
  ): Promise<void> {
    const analytics: AchievementAnalytics = {
      type: 'validation_error',
      achievementId: this.achievement.id,
      userId: event.userId,
      category: this.achievement.category,
      difficulty: this.achievement.difficulty,
      error: {
        code: validation.errorCode!,
        message: validation.errorMessage!,
      },
      metadata: {
        ...validation.metadata,
        ...event.metadata,
      },
      timestamp: Date.now(),
    };

    await this.trackAnalytics(analytics);
  }

  /**
   * Track analytics event
   */
  private async trackAnalytics(analytics: AchievementAnalytics): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `achievement_${analytics.timestamp}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Achievement ${analytics.type}: ${analytics.achievementId}`,
      },
      {
        type: analytics.type,
        achievementId: analytics.achievementId,
        userId: analytics.userId,
        category: analytics.category,
        difficulty: analytics.difficulty,
        progress: analytics.progress,
        error: analytics.error,
        metadata: analytics.metadata,
      }
    );
  }

  /**
   * Notify achievement completion
   */
  private async notifyCompletion(notification: AchievementNotification): Promise<void> {
    // Implementation would depend on notification system
    console.info('Achievement notification:', notification);
  }
}

/**
 * Count-based achievement processor
 */
export class CountAchievementProcessor extends BaseAchievementProcessor {
  protected async updateProgress(
    currentProgress: AchievementProgress,
    event: AchievementEvent
  ): Promise<AchievementProgress> {
    if (event.type !== 'progress' || !event.progress) {
      return currentProgress;
    }

    const updatedProgress = {
      ...currentProgress,
      progress: event.progress.map((value, index) => {
        const requirement = this.achievement.requirements[index];
        if (requirement.type !== AchievementTrigger.COUNT) {
          return currentProgress.progress[index];
        }
        return Math.min(value, requirement.target);
      }),
      lastUpdated: Date.now(),
    };

    return updatedProgress;
  }

  protected validateProgressValues(progress: AchievementProgress): boolean {
    return progress.progress.every((value, index) => {
      const requirement = this.achievement.requirements[index];
      return value >= 0 && value <= requirement.target && Number.isInteger(value);
    });
  }
}

/**
 * Streak-based achievement processor
 */
export class StreakAchievementProcessor extends BaseAchievementProcessor {
  protected async updateProgress(
    currentProgress: AchievementProgress,
    event: AchievementEvent
  ): Promise<AchievementProgress> {
    if (event.type !== 'progress' || !event.progress) {
      return currentProgress;
    }

    const updatedProgress = {
      ...currentProgress,
      progress: event.progress.map((value, index) => {
        const requirement = this.achievement.requirements[index];
        if (requirement.type !== AchievementTrigger.STREAK) {
          return currentProgress.progress[index];
        }

        // Check if streak is broken
        if (value === 0) {
          return 0;
        }

        // Check timeframe if specified
        if (requirement.timeframe) {
          const lastUpdate = new Date(currentProgress.lastUpdated);
          const now = new Date();
          const timeDiff = now.getTime() - lastUpdate.getTime();

          if (timeDiff > requirement.timeframe.duration) {
            return 0;
          }
        }

        return Math.min(currentProgress.progress[index] + 1, requirement.target);
      }),
      lastUpdated: Date.now(),
    };

    return updatedProgress;
  }

  protected validateProgressValues(progress: AchievementProgress): boolean {
    return progress.progress.every((value, index) => {
      const requirement = this.achievement.requirements[index];
      return value >= 0 && value <= requirement.target && Number.isInteger(value);
    });
  }
}

/**
 * Achievement processor factory
 */
export class AchievementProcessorFactory {
  private static processors: Map<string, AchievementProcessor> = new Map();

  static createProcessor(
    achievement: Achievement,
    storage: AchievementStorage
  ): AchievementProcessor {
    // Check if processor already exists
    const existing = this.processors.get(achievement.id);
    if (existing) {
      return existing;
    }

    // Create new processor
    const triggerType = achievement.requirements[0]?.type;
    let processor: AchievementProcessor;

    switch (triggerType) {
      case AchievementTrigger.COUNT:
        processor = new CountAchievementProcessor(achievement, storage);
        break;
      case AchievementTrigger.STREAK:
        processor = new StreakAchievementProcessor(achievement, storage);
        break;
      default:
        throw new Error(`Unsupported achievement trigger type: ${triggerType}`);
    }

    // Cache processor
    this.processors.set(achievement.id, processor);
    return processor;
  }

  static clearProcessors(): void {
    this.processors.clear();
  }
}
