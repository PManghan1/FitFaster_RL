import { nutritionService } from './nutrition';
import { profileService } from './profile';
import { progressService } from './progress';
import { workoutService } from './workout';
import type { NutritionLogEntry } from '../types/nutrition';
import type {
  ConsentPurpose,
  ConsentRecord,
  DecryptedHealthData,
  EssentialProfile,
  PrivacySettings,
} from '../types/profile';
import type { ProgressMetrics, WorkoutHistoryItem } from '../types/progress';
import type { Exercise, Set, WorkoutSession } from '../types/workout';

export interface WorkoutService {
  startWorkout(userId: string, name: string): Promise<WorkoutSession>;
  endWorkout(sessionId: string): Promise<void>;
  addExercise(sessionId: string, exercise: Exercise): Promise<void>;
  addSet(sessionId: string, exerciseId: string, set: Omit<Set, 'id'>): Promise<void>;
}

export interface NutritionService {
  logMeal(data: Omit<NutritionLogEntry, 'id' | 'userId' | 'timestamp' | 'type'>): Promise<void>;
  logSupplement(
    data: Omit<NutritionLogEntry, 'id' | 'userId' | 'timestamp' | 'type'>,
  ): Promise<void>;
  scanFood(barcode: string): Promise<void>;
}

export interface ProgressService {
  getProgressMetrics(userId: string): Promise<ProgressMetrics>;
  getRecentWorkouts(userId: string, limit?: number): Promise<WorkoutHistoryItem[]>;
}

export interface ProfileService {
  getProfile(userId: string): Promise<EssentialProfile | null>;
  getHealthData(userId: string): Promise<DecryptedHealthData | null>;
  updateHealthData(userId: string, data: Partial<DecryptedHealthData>): Promise<void>;
  recordConsent(
    userId: string,
    purpose: ConsentPurpose,
    granted: boolean,
    userAgent: string,
  ): Promise<void>;
  getConsentStatus(userId: string, purpose: ConsentPurpose): Promise<boolean>;
  exportUserData(userId: string): Promise<{
    profile: EssentialProfile;
    healthData: DecryptedHealthData | null;
    consents: ConsentRecord[];
    privacySettings: PrivacySettings;
  }>;
  deleteUserData(userId: string): Promise<void>;
}

export const createWorkoutService = (): WorkoutService => workoutService;
export const createNutritionService = (): NutritionService => nutritionService;
export const createProgressService = (): ProgressService => progressService;
export const createProfileService = (): ProfileService => profileService;
