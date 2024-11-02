import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { OnboardingStackParamList } from '../types/onboarding';
import type {
  HealthMetrics,
  FitnessLevel,
  GoalTimeframes,
  UserConsent,
  DietaryPreferences,
  ActivityLevel,
} from '../types/onboarding';
import { validateOnboardingData } from '../utils/validation';

type OnboardingNavigation = StackNavigationProp<OnboardingStackParamList>;

export const useOnboarding = () => {
  const navigation = useNavigation<OnboardingNavigation>();

  const handleHealthMetrics = useCallback(
    (data: HealthMetrics) => {
      const { isValid, errors } = validateOnboardingData({ healthMetrics: data });
      if (isValid) {
        // TODO: Save data to global state
        navigation.navigate('FitnessLevel');
      }
      return { isValid, errors };
    },
    [navigation]
  );

  const handleFitnessLevel = useCallback(
    (data: FitnessLevel) => {
      const { isValid, errors } = validateOnboardingData({ fitnessLevel: data });
      if (isValid) {
        // TODO: Save data to global state
        navigation.navigate('GoalTimeframes');
      }
      return { isValid, errors };
    },
    [navigation]
  );

  const handleGoalTimeframes = useCallback(
    (data: GoalTimeframes) => {
      const { isValid, errors } = validateOnboardingData({ goalTimeframes: data });
      if (isValid) {
        // TODO: Save data to global state
        navigation.navigate('UserConsent');
      }
      return { isValid, errors };
    },
    [navigation]
  );

  const handleUserConsent = useCallback(
    (data: UserConsent) => {
      const { isValid, errors } = validateOnboardingData({ userConsent: data });
      if (isValid) {
        // TODO: Save data to global state
        navigation.navigate('DietaryPreferences');
      }
      return { isValid, errors };
    },
    [navigation]
  );

  const handleDietaryPreferences = useCallback(
    (data: DietaryPreferences) => {
      const { isValid, errors } = validateOnboardingData({ dietaryPreferences: data });
      if (isValid) {
        // TODO: Save data to global state
        navigation.navigate('ActivityLevel');
      }
      return { isValid, errors };
    },
    [navigation]
  );

  const handleActivityLevel = useCallback(
    (data: ActivityLevel) => {
      const { isValid, errors } = validateOnboardingData({ activityLevel: data });
      if (isValid) {
        // TODO: Save data to global state
        navigation.navigate('OnboardingGoals');
      }
      return { isValid, errors };
    },
    [navigation]
  );

  return {
    handleHealthMetrics,
    handleFitnessLevel,
    handleGoalTimeframes,
    handleUserConsent,
    handleDietaryPreferences,
    handleActivityLevel,
  };
};
