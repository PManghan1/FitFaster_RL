import { ErrorCode } from '../../types/errors';

/**
 * Leaderboard categories
 */
export enum LeaderboardCategory {
  OVERALL = 'overall',
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  ACHIEVEMENTS = 'achievements',
  STREAK = 'streak',
  SPECIAL = 'special',
}

/**
 * Leaderboard timeframes
 */
export enum LeaderboardTimeframe {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

/**
 * Leaderboard error codes
 */
export enum LeaderboardErrorCode {
  INVALID_CATEGORY = 'LEADERBOARD_INVALID_CATEGORY',
  INVALID_TIMEFRAME = 'LEADERBOARD_INVALID_TIMEFRAME',
  UPDATE_FAILED = 'LEADERBOARD_UPDATE_FAILED',
  FETCH_FAILED = 'LEADERBOARD_FETCH_FAILED',
  PRIVACY_VIOLATION = 'LEADERBOARD_PRIVACY_VIOLATION',
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  showUsername: boolean;
  showAvatar: boolean;
  showStats: boolean;
}

/**
 * Leaderboard entry metadata
 */
export interface LeaderboardMetadata {
  username?: string;
  avatar?: string;
  achievements?: number;
  streak?: number;
  lastActive?: number;
  privacySettings?: PrivacySettings;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  userId: string;
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  rank: number;
  score: number;
  metadata?: LeaderboardMetadata;
  timestamp: number;
}

/**
 * Leaderboard update
 */
export interface LeaderboardUpdate {
  userId: string;
  category: LeaderboardCategory;
  score: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Leaderboard query options
 */
export interface LeaderboardQuery {
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  limit?: number;
  offset?: number;
  userId?: string; // For getting user's rank
  includePrivate?: boolean; // For admin queries
}

/**
 * Leaderboard result
 */
export interface LeaderboardResult {
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  entries: LeaderboardEntry[];
  total: number;
  userRank?: number;
  timestamp: number;
}

/**
 * Leaderboard storage interface
 */
export interface LeaderboardStorage {
  getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardResult>;
  updateScore(update: LeaderboardUpdate): Promise<void>;
  getUserRank(
    userId: string,
    category: LeaderboardCategory,
    timeframe: LeaderboardTimeframe
  ): Promise<number | null>;
  getUserPrivacySettings(userId: string): Promise<PrivacySettings>;
}

/**
 * Leaderboard analytics event
 */
export interface LeaderboardAnalytics {
  type: 'view' | 'update' | 'error';
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  userId?: string;
  score?: number;
  rank?: number;
  error?: {
    code: LeaderboardErrorCode | ErrorCode;
    message: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Real-time update event
 */
export interface LeaderboardUpdateEvent {
  type: 'score_update' | 'rank_change';
  userId: string;
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  oldValue: number;
  newValue: number;
  timestamp: number;
}

/**
 * Leaderboard notification
 */
export interface LeaderboardNotification {
  type: 'rank_up' | 'rank_down' | 'milestone';
  userId: string;
  category: LeaderboardCategory;
  title: string;
  message: string;
  oldRank?: number;
  newRank?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Score calculation context
 */
export interface ScoreContext {
  userId: string;
  category: LeaderboardCategory;
  timeframe: LeaderboardTimeframe;
  activityType: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Score calculator interface
 */
export interface ScoreCalculator {
  calculateScore(context: ScoreContext): Promise<number>;
  validateScore(score: number, context: ScoreContext): Promise<boolean>;
}
