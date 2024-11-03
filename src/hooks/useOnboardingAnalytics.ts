import { useCallback, useRef, useEffect } from 'react';
import { trackOnboardingEvent, OnboardingEvents } from '../analytics/onboarding-events';

export function useOnboardingAnalytics() {
  const stepStartTime = useRef<number>(Date.now());
  const currentStep = useRef<string>('');

  const trackStepTime = useCallback((stepName: string) => {
    const timeSpent = Date.now() - stepStartTime.current;
    trackOnboardingEvent(OnboardingEvents.STEP_VIEW, {
      stepName,
      timeSpent,
    });
  }, []);

  useEffect(() => {
    const step = currentStep.current;
    return () => {
      if (step) {
        trackStepTime(step);
      }
    };
  }, [trackStepTime]);

  // Rest of the implementation...
  return {
    startStep,
    trackStartOnboarding,
    trackCompleteOnboarding,
    trackHealthMetrics,
    trackFitnessLevel,
    trackGoalTimeframes,
    trackUserConsent,
    trackDietaryPreferences,
    trackActivityLevel,
    trackValidationError,
  };
}
