import { ErrorCode } from '../../types/errors';

/**
 * Achievement categories
 */
export enum AchievementCategory {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  SUPPLEMENT = 'supplement',
  STREAK = 'streak',
  SOCIAL = 'social',
  MILESTONE = 'milestone',
  EVENT = 'event',
}

/**
 * Achievement difficulty levels
 */
export enum AchievementDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

/**
 * Achievement trigger types
 */
export enum AchievementTrigger {
  COUNT = 'count', // Based on count of actions
  STREAK = 'streak', // Based on consecutive actions
  MILESTONE = 'milestone', // Based on reaching specific values
  COMPOUND = 'compound', // Based on multiple conditions
  SPECIAL = 'special', // Special event achievements
}

/**
 * Achievement validation error codes
 */
export enum AchievementErrorCode {
  INVALID_PROGRESS = 'ACHIEVEMENT_INVALID_PROGRESS',
  ALREADY_COMPLETED = 'ACHIEVEMENT_ALREADY_COMPLETED',
  PREREQUISITES_NOT_MET = 'ACHIEVEMENT_PREREQUISITES_NOT_MET',
  EXPIRED = 'ACHIEVEMENT_EXPIRED',
  VALIDATION_FAILED = 'ACHIEVEMENT_VALIDATION_FAILED',
}

/**
 * Achievement requirement definition
 */
export interface AchievementRequirement {
  type: AchievementTrigger;
  target: number;
  metric: string;
  timeframe?: {
    duration: number; // Duration in milliseconds
    rolling: boolean; // If true, uses rolling window
  };
  prerequisites?: string[]; // Achievement IDs that must be completed first
}

/**
 * Achievement reward definition
 */
export interface AchievementReward {
  points: number;
  badges?: string[];
  unlocks?: string[];
  specialRewards?: Record<string, unknown>;
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  requirements: AchievementRequirement[];
  reward: AchievementReward;
  hidden?: boolean;
  expiresAt?: number;
  order?: number;
}

/**
 * Achievement progress state
 */
export interface AchievementProgress {
  achievementId: string;
  userId: string;
  progress: number[]; // Progress for each requirement
  completed: boolean;
  completedAt?: number;
  lastUpdated: number;
  metadata?: Record<string, unknown>;
}

/**
 * Achievement update event
 */
export interface AchievementEvent {
  type: 'progress' | 'completion' | 'reset';
  achievementId: string;
  userId: string;
  timestamp: number;
  progress?: number[];
  metadata?: Record<string, unknown>;
}

/**
 * Achievement validation result
 */
export interface AchievementValidation {
  valid: boolean;
  errorCode?: AchievementErrorCode | ErrorCode;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Achievement processor interface
 */
export interface AchievementProcessor {
  processEvent(event: AchievementEvent): Promise<AchievementProgress>;
  validateProgress(progress: AchievementProgress): Promise<AchievementValidation>;
  checkCompletion(progress: AchievementProgress): Promise<boolean>;
  getAchievement(achievementId: string): Achievement | null;
}

/**
 * Achievement storage interface
 */
export interface AchievementStorage {
  getProgress(userId: string, achievementId: string): Promise<AchievementProgress | null>;
  updateProgress(progress: AchievementProgress): Promise<void>;
  listUserAchievements(userId: string): Promise<AchievementProgress[]>;
  listCategoryAchievements(category: AchievementCategory): Promise<Achievement[]>;
}

/**
 * Achievement notification
 */
export interface AchievementNotification {
  type: 'unlock' | 'progress' | 'near_completion';
  achievementId: string;
  userId: string;
  title: string;
  message: string;
  progress?: number;
  reward?: AchievementReward;
  timestamp: number;
}

/**
 * Achievement analytics event
 */
export interface AchievementAnalytics {
  type: 'progress' | 'completion' | 'validation_error';
  achievementId: string;
  userId: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  progress?: number[];
  error?: {
    code: AchievementErrorCode | ErrorCode;
    message: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: number;
}
