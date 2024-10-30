import { BaseService } from './base';
import { workoutService } from './workout';
import { nutritionService } from './nutrition';
import { progressService } from './progress';
import { profileService } from './profile';
import type { ApiResponse } from '../types/api';

// Service interfaces
export interface WorkoutService extends BaseService {
  getWorkouts(): Promise<ApiResponse<any>>;
  getWorkout(id: string): Promise<ApiResponse<any>>;
  createWorkout(data: any): Promise<ApiResponse<any>>;
  updateWorkout(id: string, data: any): Promise<ApiResponse<any>>;
  deleteWorkout(id: string): Promise<ApiResponse<any>>;
}

export interface NutritionService extends BaseService {
  getMeals(): Promise<ApiResponse<any>>;
  getMeal(id: string): Promise<ApiResponse<any>>;
  createMeal(data: any): Promise<ApiResponse<any>>;
  updateMeal(id: string, data: any): Promise<ApiResponse<any>>;
  deleteMeal(id: string): Promise<ApiResponse<any>>;
}

export interface ProgressService extends BaseService {
  getProgress(): Promise<ApiResponse<any>>;
  updateProgress(data: any): Promise<ApiResponse<any>>;
  getHistory(): Promise<ApiResponse<any>>;
}

export interface ProfileService extends BaseService {
  getProfile(): Promise<ApiResponse<any>>;
  updateProfile(data: any): Promise<ApiResponse<any>>;
  deleteProfile(): Promise<ApiResponse<any>>;
}

class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, BaseService>;

  private constructor() {
    this.services = new Map();
  }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public getWorkoutService(): WorkoutService {
    const key = 'workout';
    if (!this.services.has(key)) {
      this.services.set(key, Object.assign(workoutService, BaseService.prototype));
    }
    return this.services.get(key) as WorkoutService;
  }

  public getNutritionService(): NutritionService {
    const key = 'nutrition';
    if (!this.services.has(key)) {
      this.services.set(key, Object.assign(nutritionService, BaseService.prototype));
    }
    return this.services.get(key) as NutritionService;
  }

  public getProgressService(): ProgressService {
    const key = 'progress';
    if (!this.services.has(key)) {
      this.services.set(key, Object.assign(progressService, BaseService.prototype));
    }
    return this.services.get(key) as ProgressService;
  }

  public getProfileService(): ProfileService {
    const key = 'profile';
    if (!this.services.has(key)) {
      this.services.set(key, Object.assign(profileService, BaseService.prototype));
    }
    return this.services.get(key) as ProfileService;
  }

  public clearServices(): void {
    this.services.clear();
  }
}

export const serviceFactory = ServiceFactory.getInstance();

export const useServices = (): {
  workout: WorkoutService;
  nutrition: NutritionService;
  progress: ProgressService;
  profile: ProfileService;
} => ({
  workout: serviceFactory.getWorkoutService(),
  nutrition: serviceFactory.getNutritionService(),
  progress: serviceFactory.getProgressService(),
  profile: serviceFactory.getProfileService(),
});
