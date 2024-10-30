import type { User } from '@supabase/supabase-js';
import type { Exercise, WorkoutSession } from './workout';
import type { ProgressMetrics } from './progress';

// Generic API Response type
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  metadata?: ResponseMetadata;
}

// Response Metadata
export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  processingTime?: number;
}

// Pagination Metadata
export interface PaginationMetadata extends ResponseMetadata {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Generic Paginated Response type
export interface PaginatedResponse<T> {
  data: T[] | null;
  error: ApiError | null;
  metadata: PaginationMetadata;
}

// API Error type
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status: number;
}

// Auth API Responses
export interface AuthResponse extends ApiResponse<{
  user: User;
  token: string;
}> {}

export interface SignOutResponse extends ApiResponse<{
  success: boolean;
}> {}

// Profile API Responses
export interface ProfileData {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse extends ApiResponse<ProfileData> {}

export interface UpdateProfileResponse extends ApiResponse<{
  profile: ProfileData;
  updated: string[];
}> {}

// Workout API Responses
export interface WorkoutSessionResponse extends ApiResponse<WorkoutSession> {}

export interface WorkoutSessionsResponse extends PaginatedResponse<WorkoutSession> {}

export interface ExerciseResponse extends ApiResponse<Exercise> {}

export interface ExercisesResponse extends PaginatedResponse<Exercise> {}

export interface WorkoutStatsResponse extends ApiResponse<{
  totalSessions: number;
  totalDuration: number;
  totalVolume: number;
  favoriteExercises: Exercise[];
}> {}

// Nutrition API Responses
export interface NutritionData {
  id: string;
  userId: string;
  date: string;
  meals: MealData[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface MealData {
  id: string;
  name: string;
  time: string;
  foods: FoodData[];
  totalCalories: number;
}

export interface FoodData {
  id: string;
  name: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionEntryResponse extends ApiResponse<NutritionData> {}

export interface NutritionEntriesResponse extends PaginatedResponse<NutritionData> {}

export interface MealResponse extends ApiResponse<MealData> {}

export interface MealsResponse extends PaginatedResponse<MealData> {}

// Progress API Responses
export interface ProgressResponse extends ApiResponse<ProgressMetrics> {}

export interface ProgressHistoryResponse extends PaginatedResponse<{
  date: string;
  metrics: ProgressMetrics;
}> {}

// Health Check Response
export interface HealthCheckResponse extends ApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    cache: 'up' | 'down';
    storage: 'up' | 'down';
  };
}> {}

// Batch Operation Responses
export interface BatchOperationResponse<T> extends ApiResponse<{
  successful: T[];
  failed: Array<{
    item: T;
    error: ApiError;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}> {}

// Search Responses
export interface SearchResponse<T> extends PaginatedResponse<T> {
  metadata: PaginationMetadata & {
    query: string;
    filters: Record<string, any>;
  };
}

// File Upload Responses
export interface FileUploadResponse extends ApiResponse<{
  url: string;
  fileId: string;
  mimeType: string;
  size: number;
}> {}

// Webhook Response
export interface WebhookResponse extends ApiResponse<{
  id: string;
  event: string;
  status: 'delivered' | 'failed';
  attempts: number;
  payload: Record<string, any>;
}> {}

// Rate Limit Response
export interface RateLimitResponse extends ApiResponse<never> {
  error: ApiError & {
    retryAfter: number;
    limit: number;
    remaining: number;
    reset: number;
  };
}

// Cache Operation Responses
export interface CacheResponse<T> extends ApiResponse<{
  data: T;
  cached: boolean;
  ttl: number;
}> {}
