import { nutritionService } from './nutrition';
import { profileService } from './profile';
import { progressService } from './progress';
import { workoutService } from './workout';
import type { DailyNutrition, FoodItem, MealEntry } from '../types/nutrition';
import type {
  ConsentPurpose,
  ConsentRecord,
  DecryptedHealthData,
  EssentialProfile,
  PrivacySettings,
} from '../types/profile';
import type { ProgressMetrics, WorkoutHistoryItem } from '../types/progress';
import type { Exercise, Set, WorkoutSession, WorkoutSummary } from '../types/workout';

export interface WorkoutService {
  getExercise(id: string): Promise<Exercise>;
  searchExercises(query: string, muscleGroups?: string[]): Promise<Exercise[]>;
  createExercise(exercise: Partial<Exercise>): Promise<Exercise>;
  startWorkoutSession(userId: string, name?: string): Promise<WorkoutSession>;
  addSetToSession(
    userId: string,
    sessionId: string,
    exerciseId: string,
    setData: Partial<Set>,
  ): Promise<Set>;
  updateSessionDuration(sessionId: string, duration: number): Promise<void>;
  getWorkoutHistory(userId: string): Promise<WorkoutSummary[]>;
}

export interface NutritionService {
  getFoodItem(id: string): Promise<FoodItem>;
  searchFoodItems(query: string): Promise<FoodItem[]>;
  createFoodItem(foodItem: Partial<FoodItem>): Promise<FoodItem>;
  getMealEntries(userId: string, date: string): Promise<MealEntry[]>;
  addMealEntry(entry: Partial<MealEntry>): Promise<MealEntry>;
  updateMealEntry(id: string, updates: Partial<MealEntry>): Promise<MealEntry>;
  deleteMealEntry(id: string): Promise<void>;
  getDailyNutrition(userId: string, date: string): Promise<DailyNutrition>;
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
