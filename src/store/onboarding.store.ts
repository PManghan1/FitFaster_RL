import create from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OnboardingState,
  HealthMetric,
  FitnessLevel,
  ActivityLevel,
  DietaryPreference,
  GoalTimeframe,
  UserConsent,
} from '../types/onboarding';
import { cacheService } from '../services/cache';

interface OnboardingStore extends OnboardingState {
  updateHealthMetrics: (metrics: HealthMetric) => Promise<void>;
  updateFitnessLevel: (level: FitnessLevel) => Promise<void>;
  updateActivityLevel: (level: ActivityLevel) => Promise<void>;
  updateDietaryPreferences: (preferences: DietaryPreference) => Promise<void>;
  updateGoalTimeframes: (goals: GoalTimeframe[]) => Promise<void>;
  updateUserConsent: (consent: UserConsent) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const initialState: OnboardingState = {
  step: 0,
  completed: false,
  healthMetrics: null,
  fitnessLevel: null,
  activityLevel: null,
  dietaryPreferences: null,
  goalTimeframes: [],
  userConsent: null,
};

const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateHealthMetrics: async (metrics: HealthMetric) => {
        try {
          await cacheService.setItem('onboarding_health_metrics', metrics);
          set(state => ({
            ...state,
            healthMetrics: metrics,
            step: Math.max(state.step, 1),
          }));
        } catch (error) {
          console.error('Failed to save health metrics:', error);
          throw error;
        }
      },

      updateFitnessLevel: async (level: FitnessLevel) => {
        try {
          await cacheService.setItem('onboarding_fitness_level', level);
          set(state => ({
            ...state,
            fitnessLevel: level,
            step: Math.max(state.step, 2),
          }));
        } catch (error) {
          console.error('Failed to save fitness level:', error);
          throw error;
        }
      },

      updateActivityLevel: async (level: ActivityLevel) => {
        try {
          await cacheService.setItem('onboarding_activity_level', level);
          set(state => ({
            ...state,
            activityLevel: level,
            step: Math.max(state.step, 3),
          }));
        } catch (error) {
          console.error('Failed to save activity level:', error);
          throw error;
        }
      },

      updateDietaryPreferences: async (preferences: DietaryPreference) => {
        try {
          await cacheService.setItem('onboarding_dietary_preferences', preferences);
          set(state => ({
            ...state,
            dietaryPreferences: preferences,
            step: Math.max(state.step, 4),
          }));
        } catch (error) {
          console.error('Failed to save dietary preferences:', error);
          throw error;
        }
      },

      updateGoalTimeframes: async (goals: GoalTimeframe[]) => {
        try {
          await cacheService.setItem('onboarding_goal_timeframes', goals);
          set(state => ({
            ...state,
            goalTimeframes: goals,
            step: Math.max(state.step, 5),
          }));
        } catch (error) {
          console.error('Failed to save goal timeframes:', error);
          throw error;
        }
      },

      updateUserConsent: async (consent: UserConsent) => {
        try {
          await cacheService.setItem('onboarding_user_consent', consent);
          set(state => ({
            ...state,
            userConsent: consent,
            step: Math.max(state.step, 6),
          }));
        } catch (error) {
          console.error('Failed to save user consent:', error);
          throw error;
        }
      },

      completeOnboarding: async () => {
        try {
          const state = get();
          if (
            state.healthMetrics &&
            state.fitnessLevel &&
            state.activityLevel &&
            state.dietaryPreferences &&
            state.goalTimeframes.length > 0 &&
            state.userConsent
          ) {
            await cacheService.setItem('onboarding_completed', true);
            set({ completed: true });
          } else {
            throw new Error('Cannot complete onboarding: missing required information');
          }
        } catch (error) {
          console.error('Failed to complete onboarding:', error);
          throw error;
        }
      },

      resetOnboarding: async () => {
        try {
          await cacheService.removeItem('onboarding_completed');
          await cacheService.removeItem('onboarding_health_metrics');
          await cacheService.removeItem('onboarding_fitness_level');
          await cacheService.removeItem('onboarding_activity_level');
          await cacheService.removeItem('onboarding_dietary_preferences');
          await cacheService.removeItem('onboarding_goal_timeframes');
          await cacheService.removeItem('onboarding_user_consent');
          set(initialState);
        } catch (error) {
          console.error('Failed to reset onboarding:', error);
          throw error;
        }
      },
    }),
    {
      name: 'onboarding-storage',
    }
  )
);

export default useOnboardingStore;
