import { AnalyticsEvent } from '../types/analytics';
import type {
  HealthMetrics,
  FitnessLevel,
  ActivityLevel,
  DietaryPreference,
} from '../types/onboarding';

export const OnboardingEvents = {
  START_ONBOARDING: 'start_onboarding',
  COMPLETE_ONBOARDING: 'complete_onboarding',
  SUBMIT_HEALTH_METRICS: 'submit_health_metrics',
  SUBMIT_FITNESS_LEVEL: 'submit_fitness_level',
  SUBMIT_GOAL_TIMEFRAMES: 'submit_goal_timeframes',
  SUBMIT_USER_CONSENT: 'submit_user_consent',
  SUBMIT_DIETARY_PREFERENCES: 'submit_dietary_preferences',
  SUBMIT_ACTIVITY_LEVEL: 'submit_activity_level',
  VALIDATION_ERROR: 'onboarding_validation_error',
  STEP_VIEW: 'onboarding_step_view',
} as const;

export type OnboardingEventName = (typeof OnboardingEvents)[keyof typeof OnboardingEvents];

export interface OnboardingEventProperties {
  step?: number;
  stepName?: string;
  timeSpent?: number;
  error?: string;
  healthMetrics?: Omit<HealthMetrics, 'medications' | 'medicalConditions'>;
  fitnessLevel?: FitnessLevel;
  activityLevel?: ActivityLevel;
  dietaryPreferences?: DietaryPreference['diet'];
  goalCount?: number;
  consentGiven?: boolean[];
  validationErrors?: string[];
}

export function trackOnboardingEvent(
  name: OnboardingEventName,
  properties?: OnboardingEventProperties
): void {
  try {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
      },
    };

    // Log event for debugging in development
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }

    // Send to analytics service
    analytics.track(event);
  } catch (error) {
    console.error('Failed to track onboarding event:', error);
    // Don't throw - analytics should never break the app
  }
}
