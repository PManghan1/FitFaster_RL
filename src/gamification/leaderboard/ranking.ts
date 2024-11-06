import { ErrorCode, ErrorCategory, ErrorSeverity } from '../../types/errors';
import { analyticsService } from '../../services/analytics';
import { performanceAlerts } from '../../monitoring';
import {
  LeaderboardCategory,
  LeaderboardTimeframe,
  LeaderboardErrorCode,
  LeaderboardEntry,
  LeaderboardUpdate,
  LeaderboardQuery,
  LeaderboardResult,
  LeaderboardStorage,
  LeaderboardAnalytics,
  LeaderboardUpdateEvent,
  LeaderboardNotification,
  ScoreCalculator,
  ScoreContext,
  PrivacySettings,
} from './types';

/**
 * Leaderboard ranking system
 */
export class LeaderboardRanking {
  private static instance: LeaderboardRanking;

  private constructor(
    private storage: LeaderboardStorage,
    private calculator: ScoreCalculator
  ) {}

  static getInstance(storage: LeaderboardStorage, calculator: ScoreCalculator): LeaderboardRanking {
    if (!LeaderboardRanking.instance) {
      LeaderboardRanking.instance = new LeaderboardRanking(storage, calculator);
    }
    return LeaderboardRanking.instance;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardResult> {
    const startTime = performance.now();

    try {
      const result = await this.storage.getLeaderboard(query);

      // Apply privacy filters
      if (!query.includePrivate) {
        result.entries = await this.applyPrivacyFilters(result.entries);
      }

      // Track analytics
      await this.trackLeaderboardView(query, result);

      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > 100) {
        // 100ms threshold
        performanceAlerts.createAlert(
          'api',
          'warning',
          `Slow leaderboard fetch: ${query.category}`,
          { duration, category: ErrorCategory.PERFORMANCE }
        );
      }

      return result;
    } catch (error) {
      // Monitor performance issue
      performanceAlerts.createAlert(
        'api',
        'critical',
        `Leaderboard fetch failed: ${query.category}`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          category: ErrorCategory.DATA,
          severity: ErrorSeverity.HIGH,
        }
      );

      throw this.handleError(
        error,
        LeaderboardErrorCode.FETCH_FAILED,
        'Failed to fetch leaderboard'
      );
    }
  }

  /**
   * Update score
   */
  async updateScore(context: ScoreContext): Promise<void> {
    const startTime = performance.now();

    try {
      // Calculate new score
      const score = await this.calculator.calculateScore(context);

      // Validate score
      const valid = await this.calculator.validateScore(score, context);
      if (!valid) {
        throw this.handleError(
          new Error('Invalid score calculation'),
          LeaderboardErrorCode.UPDATE_FAILED,
          'Score validation failed',
          ErrorSeverity.HIGH
        );
      }

      // Get current rank
      const oldRank = await this.storage.getUserRank(
        context.userId,
        context.category,
        context.timeframe
      );

      // Update score
      const update: LeaderboardUpdate = {
        userId: context.userId,
        category: context.category,
        score,
        metadata: context.metadata,
        timestamp: Date.now(),
      };

      await this.storage.updateScore(update);

      // Get new rank
      const newRank = await this.storage.getUserRank(
        context.userId,
        context.category,
        context.timeframe
      );

      // Track rank change
      if (oldRank !== null && newRank !== null && oldRank !== newRank) {
        await this.handleRankChange(context.userId, context.category, oldRank, newRank);
      }

      // Track analytics
      await this.trackScoreUpdate(context, score, newRank);

      // Monitor performance
      const duration = performance.now() - startTime;
      if (duration > 100) {
        // 100ms threshold
        performanceAlerts.createAlert('api', 'warning', `Slow score update: ${context.category}`, {
          duration,
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
        });
      }
    } catch (error) {
      // Monitor performance issue
      performanceAlerts.createAlert('api', 'critical', `Score update failed: ${context.category}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: ErrorCategory.DATA,
        severity: ErrorSeverity.HIGH,
      });

      throw this.handleError(error, LeaderboardErrorCode.UPDATE_FAILED, 'Failed to update score');
    }
  }

  /**
   * Apply privacy filters to leaderboard entries
   */
  private async applyPrivacyFilters(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    return Promise.all(
      entries.map(async entry => {
        const privacySettings = await this.storage.getUserPrivacySettings(entry.userId);
        const filteredEntry = { ...entry };

        if (!this.shouldShowUserData(privacySettings)) {
          delete filteredEntry.metadata?.username;
          delete filteredEntry.metadata?.avatar;
          filteredEntry.userId = 'anonymous';
        }

        if (!this.shouldShowStats(privacySettings)) {
          delete filteredEntry.metadata?.achievements;
          delete filteredEntry.metadata?.streak;
          delete filteredEntry.metadata?.lastActive;
        }

        return filteredEntry;
      })
    );
  }

  /**
   * Check if user data should be shown
   */
  private shouldShowUserData(settings: PrivacySettings): boolean {
    return settings.showUsername && settings.showAvatar;
  }

  /**
   * Check if stats should be shown
   */
  private shouldShowStats(settings: PrivacySettings): boolean {
    return settings.showStats;
  }

  /**
   * Handle rank change
   */
  private async handleRankChange(
    userId: string,
    category: LeaderboardCategory,
    oldRank: number,
    newRank: number
  ): Promise<void> {
    // Create update event
    const updateEvent: LeaderboardUpdateEvent = {
      type: 'rank_change',
      userId,
      category,
      timeframe: LeaderboardTimeframe.ALL_TIME,
      oldValue: oldRank,
      newValue: newRank,
      timestamp: Date.now(),
    };

    // Create notification
    const notification: LeaderboardNotification = {
      type: newRank < oldRank ? 'rank_up' : 'rank_down',
      userId,
      category,
      title: 'Rank Update',
      message: this.getRankChangeMessage(oldRank, newRank),
      oldRank,
      newRank,
      timestamp: Date.now(),
    };

    await Promise.all([this.notifyRankChange(notification), this.trackRankChange(updateEvent)]);
  }

  /**
   * Get rank change message
   */
  private getRankChangeMessage(oldRank: number, newRank: number): string {
    const rankDiff = Math.abs(oldRank - newRank);
    const direction = newRank < oldRank ? 'up' : 'down';
    return `You've moved ${direction} ${rankDiff} position${rankDiff > 1 ? 's' : ''}!`;
  }

  /**
   * Track leaderboard view
   */
  private async trackLeaderboardView(
    query: LeaderboardQuery,
    result: LeaderboardResult
  ): Promise<void> {
    const analytics: LeaderboardAnalytics = {
      type: 'view',
      category: query.category,
      timeframe: query.timeframe,
      userId: query.userId,
      metadata: {
        total: result.total,
        userRank: result.userRank,
      },
      timestamp: Date.now(),
    };

    await this.trackAnalytics(analytics);
  }

  /**
   * Track score update
   */
  private async trackScoreUpdate(
    context: ScoreContext,
    score: number,
    rank: number | null
  ): Promise<void> {
    const analytics: LeaderboardAnalytics = {
      type: 'update',
      category: context.category,
      timeframe: context.timeframe,
      userId: context.userId,
      score,
      rank: rank || undefined,
      metadata: context.metadata,
      timestamp: Date.now(),
    };

    await this.trackAnalytics(analytics);
  }

  /**
   * Track rank change
   */
  private async trackRankChange(event: LeaderboardUpdateEvent): Promise<void> {
    const analytics: LeaderboardAnalytics = {
      type: 'update',
      category: event.category,
      timeframe: event.timeframe,
      userId: event.userId,
      rank: event.newValue,
      metadata: {
        oldRank: event.oldValue,
        type: event.type,
      },
      timestamp: event.timestamp,
    };

    await this.trackAnalytics(analytics);
  }

  /**
   * Track analytics event
   */
  private async trackAnalytics(analytics: LeaderboardAnalytics): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `leaderboard_${analytics.timestamp}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Leaderboard ${analytics.type}: ${analytics.category}`,
      },
      {
        type: analytics.type,
        category: analytics.category,
        timeframe: analytics.timeframe,
        userId: analytics.userId,
        score: analytics.score,
        rank: analytics.rank,
        error: analytics.error,
        metadata: analytics.metadata,
      }
    );
  }

  /**
   * Handle error
   */
  private handleError(
    error: unknown,
    code: LeaderboardErrorCode | ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): Error {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${message}: ${errorMessage}`);

    performanceAlerts.createAlert(
      'api',
      severity === ErrorSeverity.CRITICAL ? 'critical' : 'warning',
      message,
      {
        error: errorMessage,
        code,
        category: ErrorCategory.DATA,
        severity,
      }
    );

    return new Error(message);
  }

  /**
   * Notify rank change
   */
  private async notifyRankChange(notification: LeaderboardNotification): Promise<void> {
    // Implementation would depend on notification system
    console.info('Leaderboard notification:', notification);
  }
}
