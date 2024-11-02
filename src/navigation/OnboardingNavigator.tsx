import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../types/onboarding';

// Import existing screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import OnboardingGoalsScreen from '../screens/onboarding/OnboardingGoalsScreen';

// Import new screens (we'll create these next)
import HealthMetricsScreen from '../screens/onboarding/HealthMetricsScreen';
import FitnessLevelScreen from '../screens/onboarding/FitnessLevelScreen';
import GoalTimeframesScreen from '../screens/onboarding/GoalTimeframesScreen';
import UserConsentScreen from '../screens/onboarding/UserConsentScreen';
import DietaryPreferencesScreen from '../screens/onboarding/DietaryPreferencesScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="HealthMetrics" component={HealthMetricsScreen} />
      <Stack.Screen name="FitnessLevel" component={FitnessLevelScreen} />
      <Stack.Screen name="GoalTimeframes" component={GoalTimeframesScreen} />
      <Stack.Screen name="UserConsent" component={UserConsentScreen} />
      <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="OnboardingGoals" component={OnboardingGoalsScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
