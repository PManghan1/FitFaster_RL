import { ErrorCode } from '../../types/errors';

/**
 * Reward types
 */
export enum RewardType {
  POINTS = 'points',
  BADGE = 'badge',
  UNLOCK = 'unlock',
  SPECIAL = 'special',
}

/**
 * Reward error codes
 */
export enum RewardErrorCode {
  ALREADY_CLAIMED = 'REWARD_ALREADY_CLAIMED',
  INSUFFICIENT_POINTS = 'REWARD_INSUFFICIENT_POINTS',
  INVALID_REWARD = 'REWARD_INVALID',
  EXPIRED = 'REWARD_EXPIRED',
  NOT_ELIGIBLE = 'REWARD_NOT_ELIGIBLE',
}

/**
 * Base reward interface
 */
export interface Reward {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  value: number;
  expiresAt?: number;
  requirements?: {
    points?: number;
    achievements?: string[];
    level?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Badge reward
 */
export interface BadgeReward extends Reward {
  type: RewardType.BADGE;
  imageUrl: string;
  tier?: string;
}

/**
 * Unlock reward
 */
export interface UnlockReward extends Reward {
  type: RewardType.UNLOCK;
  featureId: string;
  duration?: number; // Duration in milliseconds, undefined means permanent
}

/**
 * Special reward
 */
export interface SpecialReward extends Reward {
  type: RewardType.SPECIAL;
  specialType: string;
  data: Record<string, unknown>;
}

/**
 * User reward state
 */
export interface UserReward {
  userId: string;
  rewardId: string;
  claimed: boolean;
  claimedAt?: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Reward claim result
 */
export interface RewardClaimResult {
  success: boolean;
  reward: Reward;
  error?: {
    code: RewardErrorCode | ErrorCode;
    message: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Reward storage interface
 */
export interface RewardStorage {
  getUserRewards(userId: string): Promise<UserReward[]>;
  getReward(rewardId: string): Promise<Reward | null>;
  claimReward(userId: string, rewardId: string): Promise<RewardClaimResult>;
  updateUserReward(userReward: UserReward): Promise<void>;
}

/**
 * Reward analytics event
 */
export interface RewardAnalytics {
  type: 'claim' | 'expiry' | 'error';
  userId: string;
  rewardId: string;
  rewardType: RewardType;
  success: boolean;
  error?: {
    code: RewardErrorCode | ErrorCode;
    message: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Reward notification
 */
export interface RewardNotification {
  type: 'claim' | 'expiry' | 'reminder';
  userId: string;
  rewardId: string;
  title: string;
  message: string;
  reward: Reward;
  metadata?: Record<string, unknown>;
  timestamp: number;
}
