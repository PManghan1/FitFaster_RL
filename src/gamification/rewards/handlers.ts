import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../../services/analytics';
import { performanceAlerts } from '../../monitoring';
import {
  Reward,
  RewardType,
  RewardErrorCode,
  RewardStorage,
  UserReward,
  RewardClaimResult,
  RewardAnalytics,
  RewardNotification,
  UnlockReward,
} from './types';

/**
 * Reward processor
 */
export class RewardProcessor {
  private static instance: RewardProcessor;

  private constructor(private storage: RewardStorage) {}

  static getInstance(storage: RewardStorage): RewardProcessor {
    if (!RewardProcessor.instance) {
      RewardProcessor.instance = new RewardProcessor(storage);
    }
    return RewardProcessor.instance;
  }

  /**
   * Claim reward
   */
  async claimReward(userId: string, rewardId: string): Promise<RewardClaimResult> {
    const startTime = performance.now();

    try {
      // Get reward and user reward state
      const [reward, userRewards] = await Promise.all([
        this.storage.getReward(rewardId),
        this.storage.getUserRewards(userId),
      ]);

      // Validate reward
      if (!reward) {
        return this.handleError(
          userId,
          rewardId,
          RewardErrorCode.INVALID_REWARD,
          'Reward not found',
          ErrorCategory.DATA,
          ErrorSeverity.MEDIUM
        );
      }

      // Check if already claimed
      const existingReward = userRewards.find(r => r.rewardId === rewardId);
      if (existingReward?.claimed) {
        return this.handleError(
          userId,
          rewardId,
          RewardErrorCode.ALREADY_CLAIMED,
          'Reward already claimed',
          ErrorCategory.DATA,
          ErrorSeverity.LOW
        );
      }

      // Check expiration
      if (reward.expiresAt && Date.now() > reward.expiresAt) {
        return this.handleError(
          userId,
          rewardId,
          RewardErrorCode.EXPIRED,
          'Reward has expired',
          ErrorCategory.DATA,
          ErrorSeverity.LOW
        );
      }

      // Check requirements
      const eligible = await this.checkEligibility(userId, reward);
      if (!eligible) {
        return this.handleError(
          userId,
          rewardId,
          RewardErrorCode.NOT_ELIGIBLE,
          'Requirements not met',
          ErrorCategory.DATA,
          ErrorSeverity.LOW
        );
      }

      // Create or update user reward
      const userReward: UserReward = {
        userId,
        rewardId,
        claimed: true,
        claimedAt: Date.now(),
        expiresAt: this.calculateExpiry(reward),
      };

      await this.storage.updateUserReward(userReward);

      // Track success
      const result: RewardClaimResult = {
        success: true,
        reward,
        metadata: {
          claimedAt: userReward.claimedAt,
          expiresAt: userReward.expiresAt,
        },
      };

      await this.trackSuccess(userId, reward, result);

      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > 100) {
        // 100ms threshold
        performanceAlerts.createAlert('api', 'warning', `Slow reward processing: ${rewardId}`, {
          duration,
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
        });
      }

      return result;
    } catch (error) {
      // Monitor performance issue
      performanceAlerts.createAlert('api', 'critical', `Reward processing failed: ${rewardId}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.HIGH,
      });

      return this.handleError(
        userId,
        rewardId,
        ErrorCode.DATA_CORRUPT,
        'Failed to process reward',
        ErrorCategory.DATA,
        ErrorSeverity.HIGH
      );
    }
  }

  /**
   * Check reward eligibility
   */
  private async checkEligibility(userId: string, reward: Reward): Promise<boolean> {
    if (!reward.requirements) return true;

    const userRewards = await this.storage.getUserRewards(userId);
    const userPoints = this.calculateUserPoints(userRewards);

    // Check points requirement
    if (reward.requirements.points && userPoints < reward.requirements.points) {
      performanceAlerts.createAlert(
        'api',
        'warning',
        `Insufficient points for reward: ${reward.id}`,
        {
          required: reward.requirements.points,
          current: userPoints,
          category: ErrorCategory.DATA,
          severity: ErrorSeverity.LOW,
        }
      );
      return false;
    }

    // Check achievement requirements
    if (reward.requirements.achievements?.length) {
      const unclaimedAchievements = reward.requirements.achievements.filter(
        achievementId => !userRewards.some(r => r.rewardId === achievementId && r.claimed)
      );
      if (unclaimedAchievements.length > 0) {
        performanceAlerts.createAlert(
          'api',
          'warning',
          `Missing achievements for reward: ${reward.id}`,
          {
            missing: unclaimedAchievements,
            category: ErrorCategory.DATA,
            severity: ErrorSeverity.LOW,
          }
        );
        return false;
      }
    }

    // Check level requirement
    if (reward.requirements.level) {
      const userLevel = this.calculateUserLevel(userPoints);
      if (userLevel < reward.requirements.level) {
        performanceAlerts.createAlert(
          'api',
          'warning',
          `Insufficient level for reward: ${reward.id}`,
          {
            required: reward.requirements.level,
            current: userLevel,
            category: ErrorCategory.DATA,
            severity: ErrorSeverity.LOW,
          }
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate user points
   */
  private calculateUserPoints(userRewards: UserReward[]): number {
    return userRewards
      .filter(r => r.claimed)
      .reduce((total, r) => total + ((r.metadata?.points as number) || 0), 0);
  }

  /**
   * Calculate user level based on points
   */
  private calculateUserLevel(points: number): number {
    // Implementation would depend on level progression system
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  /**
   * Calculate reward expiry
   */
  private calculateExpiry(reward: Reward): number | undefined {
    if (reward.type === RewardType.UNLOCK) {
      const unlockReward = reward as UnlockReward;
      if (unlockReward.duration) {
        return Date.now() + unlockReward.duration;
      }
    }
    return reward.expiresAt;
  }

  /**
   * Handle reward error
   */
  private async handleError(
    userId: string,
    rewardId: string,
    code: RewardErrorCode | ErrorCode,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity
  ): Promise<RewardClaimResult> {
    const reward = await this.storage.getReward(rewardId);
    if (!reward) {
      return {
        success: false,
        reward: {} as Reward,
        error: {
          code: RewardErrorCode.INVALID_REWARD,
          message: 'Reward not found',
        },
      };
    }

    const result: RewardClaimResult = {
      success: false,
      reward,
      error: { code, message },
    };

    await this.trackError(userId, reward, result, category, severity);

    return result;
  }

  /**
   * Track successful reward claim
   */
  private async trackSuccess(
    userId: string,
    reward: Reward,
    result: RewardClaimResult
  ): Promise<void> {
    const analytics: RewardAnalytics = {
      type: 'claim',
      userId,
      rewardId: reward.id,
      rewardType: reward.type,
      success: true,
      metadata: result.metadata,
      timestamp: Date.now(),
    };

    const notification: RewardNotification = {
      type: 'claim',
      userId,
      rewardId: reward.id,
      title: 'Reward Claimed',
      message: `You've claimed: ${reward.title}`,
      reward,
      metadata: result.metadata,
      timestamp: Date.now(),
    };

    await Promise.all([
      this.trackAnalytics(analytics, ErrorCategory.DATA, ErrorSeverity.LOW),
      this.notifyUser(notification),
    ]);
  }

  /**
   * Track reward error
   */
  private async trackError(
    userId: string,
    reward: Reward,
    result: RewardClaimResult,
    category: ErrorCategory,
    severity: ErrorSeverity
  ): Promise<void> {
    const analytics: RewardAnalytics = {
      type: 'error',
      userId,
      rewardId: reward.id,
      rewardType: reward.type,
      success: false,
      error: result.error,
      metadata: result.metadata,
      timestamp: Date.now(),
    };

    await this.trackAnalytics(analytics, category, severity);
  }

  /**
   * Track analytics event
   */
  private async trackAnalytics(
    analytics: RewardAnalytics,
    category: ErrorCategory,
    severity: ErrorSeverity
  ): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `reward_${analytics.timestamp}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Reward ${analytics.type}: ${analytics.rewardId}`,
      },
      {
        type: analytics.type,
        rewardId: analytics.rewardId,
        userId: analytics.userId,
        rewardType: analytics.rewardType,
        success: analytics.success,
        error: analytics.error,
        metadata: analytics.metadata,
        category,
        severity,
      }
    );
  }

  /**
   * Notify user
   */
  private async notifyUser(notification: RewardNotification): Promise<void> {
    // Implementation would depend on notification system
    console.info('Reward notification:', notification);
  }
}
