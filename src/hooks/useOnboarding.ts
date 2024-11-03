import { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { OnboardingStackParamList } from '../types/onboarding';
import type {
  HealthMetrics,
  FitnessLevel,
  GoalTimeframe,
  UserConsent,
  DietaryPreference,
  ActivityLevel,
} from '../types/onboarding';
import { validateOnboardingData } from '../utils/validation';
import useOnboardingStore from '../store/onboarding.store';
import { useOnboardingAnalytics } from './useOnboardingAnalytics';

type OnboardingNavigation = StackNavigationProp<OnboardingStackParamList>;

export const useOnboarding = () => {
  const navigation = useNavigation<OnboardingNavigation>();
  const {
    updateHealthMetrics,
    updateFitnessLevel,
    updateActivityLevel,
    updateDietaryPreferences,
    updateGoalTimeframes,
    updateUserConsent,
    completeOnboarding,
    step,
    completed,
  } = useOnboardingStore();

  const {
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
  } = useOnboardingAnalytics();

  useEffect(() => {
    if (step === 0 && !completed) {
      trackStartOnboarding();
    }
  }, [step, completed, trackStartOnboarding]);

  const handleHealthMetrics = useCallback(
    async (data: HealthMetrics) => {
      startStep('HealthMetrics');
      const { isValid, errors } = validateOnboardingData({ healthMetrics: data });

      if (!isValid) {
        trackValidationError('HealthMetrics', Object.values(errors || {}));
        return { isValid, errors };
      }

      try {
        await updateHealthMetrics(data);
        trackHealthMetrics(data);
        navigation.navigate('FitnessLevel');
        return { isValid, errors };
      } catch (error) {
        console.error('Failed to save health metrics:', error);
        return { isValid: false, errors: { submit: 'Failed to save data' } };
      }
    },
    [navigation, updateHealthMetrics, trackHealthMetrics, startStep, trackValidationError]
  );

  const handleFitnessLevel = useCallback(
    async (data: FitnessLevel) => {
      startStep('FitnessLevel');
      const { isValid, errors } = validateOnboardingData({ fitnessLevel: data });

      if (!isValid) {
        trackValidationError('FitnessLevel', Object.values(errors || {}));
        return { isValid, errors };
      }

      try {
        await updateFitnessLevel(data);
        trackFitnessLevel(data);
        navigation.navigate('GoalTimeframes');
        return { isValid, errors };
      } catch (error) {
        console.error('Failed to save fitness level:', error);
        return { isValid: false, errors: { submit: 'Failed to save data' } };
      }
    },
    [navigation, updateFitnessLevel, trackFitnessLevel, startStep, trackValidationError]
  );

  const handleGoalTimeframes = useCallback(
    async (data: GoalTimeframe[]) => {
      startStep('GoalTimeframes');
      const { isValid, errors } = validateOnboardingData({ goalTimeframes: data });

      if (!isValid) {
        trackValidationError('GoalTimeframes', Object.values(errors || {}));
        return { isValid, errors };
      }

      try {
        await updateGoalTimeframes(data);
        trackGoalTimeframes(data);
        navigation.navigate('UserConsent');
        return { isValid, errors };
      } catch (error) {
        console.error('Failed to save goal timeframes:', error);
        return { isValid: false, errors: { submit: 'Failed to save data' } };
      }
    },
    [navigation, updateGoalTimeframes, trackGoalTimeframes, startStep, trackValidationError]
  );

  const handleUserConsent = useCallback(
    async (data: UserConsent) => {
      startStep('UserConsent');
      const { isValid, errors } = validateOnboardingData({ userConsent: data });

      if (!isValid) {
        trackValidationError('UserConsent', Object.values(errors || {}));
        return { isValid, errors };
      }

      try {
        await updateUserConsent(data);
        trackUserConsent(data);
        navigation.navigate('DietaryPreferences');
        return { isValid, errors };
      } catch (error) {
        console.error('Failed to save user consent:', error);
        return { isValid: false, errors: { submit: 'Failed to save data' } };
      }
    },
    [navigation, updateUserConsent, trackUserConsent, startStep, trackValidationError]
  );

  const handleDietaryPreferences = useCallback(
    async (data: DietaryPreference) => {
      startStep('DietaryPreferences');
      const { isValid, errors } = validateOnboardingData({ dietaryPreferences: data });

      if (!isValid) {
        trackValidationError('DietaryPreferences', Object.values(errors || {}));
        return { isValid, errors };
      }

      try {
        await updateDietaryPreferences(data);
        trackDietaryPreferences(data);
        navigation.navigate('ActivityLevel');
        return { isValid, errors };
      } catch (error) {
        console.error('Failed to save dietary preferences:', error);
        return { isValid: false, errors: { submit: 'Failed to save data' } };
      }
    },
    [navigation, updateDietaryPreferences, trackDietaryPreferences, startStep, trackValidationError]
  );

  const handleActivityLevel = useCallback(
    async (data: ActivityLevel) => {
      startStep('ActivityLevel');
      const { isValid, errors } = validateOnboardingData({ activityLevel: data });

      if (!isValid) {
        trackValidationError('ActivityLevel', Object.values(errors || {}));
        return { isValid, errors };
      }

      try {
        await updateActivityLevel(data);
        await completeOnboarding();
        trackActivityLevel(data);
        trackCompleteOnboarding();
        navigation.navigate('OnboardingGoals');
        return { isValid, errors };
      } catch (error) {
        console.error('Failed to save activity level:', error);
        return { isValid: false, errors: { submit: 'Failed to save data' } };
      }
    },
    [
      navigation,
      updateActivityLevel,
      completeOnboarding,
      trackActivityLevel,
      trackCompleteOnboarding,
      startStep,
      trackValidationError,
    ]
  );

  const getCurrentStep = useCallback(() => {
    return { step, completed };
  }, [step, completed]);

  return {
    handleHealthMetrics,
    handleFitnessLevel,
    handleGoalTimeframes,
    handleUserConsent,
    handleDietaryPreferences,
    handleActivityLevel,
    getCurrentStep,
  };
};
