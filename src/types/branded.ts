// Branded Types for type-safe IDs
declare const brand: unique symbol;

type Brand<K, T> = K & { readonly [brand]: T };

export type UserId = Brand<string, 'UserId'>;
export type WorkoutId = Brand<string, 'WorkoutId'>;
export type ExerciseId = Brand<string, 'ExerciseId'>;
export type ProfileId = Brand<string, 'ProfileId'>;
export type NutritionEntryId = Brand<string, 'NutritionEntryId'>;
export type MealId = Brand<string, 'MealId'>;
export type FoodId = Brand<string, 'FoodId'>;
export type SessionId = Brand<string, 'SessionId'>;

// Type guard functions
export const isUserId = (id: string): id is UserId => {
  return typeof id === 'string' && id.startsWith('user_');
};

export const isWorkoutId = (id: string): id is WorkoutId => {
  return typeof id === 'string' && id.startsWith('workout_');
};

export const isExerciseId = (id: string): id is ExerciseId => {
  return typeof id === 'string' && id.startsWith('exercise_');
};

export const isProfileId = (id: string): id is ProfileId => {
  return typeof id === 'string' && id.startsWith('profile_');
};

export const isNutritionEntryId = (id: string): id is NutritionEntryId => {
  return typeof id === 'string' && id.startsWith('nutrition_');
};

export const isMealId = (id: string): id is MealId => {
  return typeof id === 'string' && id.startsWith('meal_');
};

export const isFoodId = (id: string): id is FoodId => {
  return typeof id === 'string' && id.startsWith('food_');
};

export const isSessionId = (id: string): id is SessionId => {
  return typeof id === 'string' && id.startsWith('session_');
};

// ID Creation functions
export const createUserId = (id: string): UserId => {
  return `user_${id}` as UserId;
};

export const createWorkoutId = (id: string): WorkoutId => {
  return `workout_${id}` as WorkoutId;
};

export const createExerciseId = (id: string): ExerciseId => {
  return `exercise_${id}` as ExerciseId;
};

export const createProfileId = (id: string): ProfileId => {
  return `profile_${id}` as ProfileId;
};

export const createNutritionEntryId = (id: string): NutritionEntryId => {
  return `nutrition_${id}` as NutritionEntryId;
};

export const createMealId = (id: string): MealId => {
  return `meal_${id}` as MealId;
};

export const createFoodId = (id: string): FoodId => {
  return `food_${id}` as FoodId;
};

export const createSessionId = (id: string): SessionId => {
  return `session_${id}` as SessionId;
};
